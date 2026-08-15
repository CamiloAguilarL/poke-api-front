import type { z } from 'zod'
import {
  type GenderBreakdown,
  isPokemonType,
  type PokemonCatalogQuery,
  type PokemonDetail,
  type PokemonSummary,
  type PokemonSummaryPage,
  POKEMON_TYPES,
  type PokemonTypeName,
  type Weakness,
} from '../domain/models'
import { formatPokemonName } from '../domain/formatters'
import {
  abilitySchema,
  graphQlEnvelopeSchema,
  pokemonCatalogDataSchema,
  pokemonSchema,
  pokemonSpeciesSchema,
  type PokemonDto,
  type PokemonSpeciesDto,
  type PokemonTypeDto,
  typeSchema,
} from './schemas'

const API_URL = 'https://pokeapi.co/api/v2'
const GRAPHQL_URL = 'https://graphql.pokeapi.co/v1beta2'
const SPRITES_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const DEFAULT_TTL = 30 * 60 * 1000
const STATIC_TTL = 24 * 60 * 60 * 1000

const CATALOG_QUERY = `
  query Catalog($limit: Int!, $offset: Int!, $where: pokemon_bool_exp!) {
    pokemon_aggregate(where: $where) {
      aggregate { count }
    }
    pokemon(limit: $limit, offset: $offset, order_by: { id: asc }, where: $where) {
      id
      name
      pokemontypes(order_by: { slot: asc }) {
        type { name }
      }
    }
  }
`

interface CacheEntry {
  expiresAt: number
  value: unknown
}

export class PokeApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'PokeApiError'
  }
}

export interface PokemonRepository {
  searchPage(query: PokemonCatalogQuery): Promise<PokemonSummaryPage>
  getSummary(name: string): Promise<PokemonSummary>
  getDetail(name: string): Promise<PokemonDetail>
  clearCache(): void
}

const cache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<unknown>>()

async function request<T>(pathOrUrl: string, schema: z.ZodType<T>, ttl = DEFAULT_TTL): Promise<T> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API_URL}${pathOrUrl}`
  const cached = cache.get(url)
  if (cached && cached.expiresAt > Date.now()) return cached.value as T

  const pending = inFlight.get(url)
  if (pending) return pending as Promise<T>

  const promise = fetch(url, { headers: { Accept: 'application/json' } })
    .then(async (response) => {
      if (!response.ok) {
        throw new PokeApiError(
          response.status === 404
            ? 'No encontramos este Pokémon.'
            : 'PokeAPI no respondió correctamente.',
          response.status,
        )
      }
      return response.json()
    })
    .then((data) => {
      const parsed = schema.safeParse(data)
      if (!parsed.success) {
        throw new PokeApiError('PokeAPI devolvió información con un formato inesperado.')
      }
      cache.set(url, { expiresAt: Date.now() + ttl, value: parsed.data })
      return parsed.data
    })
    .finally(() => inFlight.delete(url))

  inFlight.set(url, promise)
  return promise
}

async function graphQlRequest<T>(
  operation: string,
  variables: Record<string, unknown>,
  schema: z.ZodType<T>,
): Promise<T> {
  const cacheKey = `graphql:${JSON.stringify({ operation, variables })}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value as T

  const pending = inFlight.get(cacheKey)
  if (pending) return pending as Promise<T>

  const promise = fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: operation, variables }),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new PokeApiError('PokeAPI no respondió correctamente.', response.status)
      }
      return response.json()
    })
    .then((data) => {
      const envelope = graphQlEnvelopeSchema.safeParse(data)
      if (!envelope.success) {
        throw new PokeApiError('PokeAPI devolvió información con un formato inesperado.')
      }
      if (envelope.data.errors?.length) {
        throw new PokeApiError(envelope.data.errors.map(({ message }) => message).join('. '))
      }
      const parsed = schema.safeParse(envelope.data.data)
      if (!parsed.success) {
        throw new PokeApiError('PokeAPI devolvió información con un formato inesperado.')
      }
      cache.set(cacheKey, { expiresAt: Date.now() + DEFAULT_TTL, value: parsed.data })
      return parsed.data
    })
    .finally(() => inFlight.delete(cacheKey))

  inFlight.set(cacheKey, promise)
  return promise
}

function catalogWhere(query: string, types: PokemonTypeName[]): Record<string, unknown> {
  const clauses: Record<string, unknown>[] = []
  const normalizedQuery = query.trim().toLocaleLowerCase('es')

  if (normalizedQuery) {
    const escapedQuery = normalizedQuery.replace(/[\\%_]/g, '\\$&')
    const nameFilter = { name: { _ilike: `%${escapedQuery}%` } }
    if (/^\d+$/.test(normalizedQuery)) {
      clauses.push({ _or: [nameFilter, { id: { _eq: Number(normalizedQuery) } }] })
    } else {
      clauses.push(nameFilter)
    }
  }

  if (types.length) {
    clauses.push({ pokemontypes: { type: { name: { _in: types } } } })
  }

  return {
    is_default: { _eq: true },
    ...(clauses.length ? { _and: clauses } : {}),
  }
}

function catalogSummary(
  pokemon: z.infer<typeof pokemonCatalogDataSchema>['pokemon'][number],
): PokemonSummary {
  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatPokemonName(pokemon.name),
    sprite: `${SPRITES_URL}/${pokemon.id}.png`,
    artwork: `${SPRITES_URL}/other/official-artwork/${pokemon.id}.png`,
    types: pokemon.pokemontypes.map(({ type }) => type.name).filter(isPokemonType),
  }
}

function localized(items: Array<{ name: string; language: { name: string } }>, fallback: string) {
  return items.find(({ language }) => language.name === 'es')?.name ?? fallback
}

function preferredSprite(sprites: PokemonDto['sprites']): string | null {
  const source = sprites as Record<string, any>
  return (
    source.versions?.['generation-v']?.['black-white']?.front_default ??
    source.front_default ??
    source.other?.['official-artwork']?.front_default ??
    null
  )
}

function detailSprite(sprites: PokemonDto['sprites']): string | null {
  const source = sprites as Record<string, any>
  return source.versions?.['generation-ii']?.crystal?.front_default ?? preferredSprite(sprites)
}

function officialArtwork(sprites: PokemonDto['sprites']): string | null {
  const source = sprites as Record<string, any>
  return source.other?.['official-artwork']?.front_default ?? source.front_default ?? null
}

function toSummary(
  pokemon: PokemonDto,
  displayName = formatPokemonName(pokemon.name),
): PokemonSummary {
  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName,
    sprite: preferredSprite(pokemon.sprites),
    artwork: officialArtwork(pokemon.sprites),
    types: pokemon.types
      .sort((left, right) => left.slot - right.slot)
      .map(({ type }) => type.name)
      .filter(isPokemonType),
  }
}

function genderFromRate(rate: number): GenderBreakdown {
  if (rate === -1) return { genderless: true, male: 0, female: 0 }
  const female = (rate / 8) * 100
  return { genderless: false, female, male: 100 - female }
}

function descriptionFromSpecies(species: PokemonSpeciesDto): string {
  const entry =
    species.flavor_text_entries.find(({ language }) => language.name === 'es') ??
    species.flavor_text_entries.find(({ language }) => language.name === 'en')
  return (
    entry?.flavor_text
      .replaceAll(/[\n\f\r]+/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim() ?? 'Sin descripción disponible.'
  )
}

function calculateWeaknesses(types: PokemonTypeDto[]): Weakness[] {
  const multipliers = new Map<PokemonTypeName, number>(POKEMON_TYPES.map((type) => [type, 1]))

  for (const type of types) {
    for (const relation of type.damage_relations.double_damage_from) {
      if (isPokemonType(relation.name))
        multipliers.set(relation.name, (multipliers.get(relation.name) ?? 1) * 2)
    }
    for (const relation of type.damage_relations.half_damage_from) {
      if (isPokemonType(relation.name))
        multipliers.set(relation.name, (multipliers.get(relation.name) ?? 1) * 0.5)
    }
    for (const relation of type.damage_relations.no_damage_from) {
      if (isPokemonType(relation.name)) multipliers.set(relation.name, 0)
    }
  }

  return POKEMON_TYPES.map((type) => ({ type, multiplier: multipliers.get(type) ?? 1 }))
    .filter(({ multiplier }) => multiplier > 1)
    .sort((left, right) => right.multiplier - left.multiplier)
}

class PokeApiRepository implements PokemonRepository {
  async searchPage(query: PokemonCatalogQuery): Promise<PokemonSummaryPage> {
    const response = await graphQlRequest(
      CATALOG_QUERY,
      {
        limit: query.limit,
        offset: query.offset,
        where: catalogWhere(query.query, query.types),
      },
      pokemonCatalogDataSchema,
    )
    const summaries = response.pokemon.map(catalogSummary)
    const count = response.pokemon_aggregate.aggregate.count
    const nextOffset = query.offset + summaries.length

    return {
      count,
      summaries,
      nextOffset: nextOffset < count ? nextOffset : null,
    }
  }

  async getSummary(name: string): Promise<PokemonSummary> {
    const pokemon = await request(`/pokemon/${encodeURIComponent(name)}`, pokemonSchema)
    return toSummary(pokemon)
  }

  async getDetail(name: string): Promise<PokemonDetail> {
    const [pokemon, species] = await Promise.all([
      request(`/pokemon/${encodeURIComponent(name)}`, pokemonSchema),
      request(`/pokemon-species/${encodeURIComponent(name)}`, pokemonSpeciesSchema, STATIC_TTL),
    ])

    const [typeResources, abilityResources] = await Promise.all([
      Promise.all(
        pokemon.types.map(({ type }) => request(`/type/${type.name}`, typeSchema, STATIC_TTL)),
      ),
      Promise.all(
        pokemon.abilities.map(({ ability }) =>
          request(`/ability/${ability.name}`, abilitySchema, STATIC_TTL),
        ),
      ),
    ])

    const displayName = localized(species.names, formatPokemonName(pokemon.name))
    const category = localized(
      species.genera.map(({ genus, language }) => ({
        name: genus.replace(/Pokémon\s*/i, '').trim(),
        language,
      })),
      'Sin categoría',
    )
    return {
      ...toSummary(pokemon, displayName),
      detailSprite: detailSprite(pokemon.sprites),
      description: descriptionFromSpecies(species),
      weightHectograms: pokemon.weight,
      heightDecimeters: pokemon.height,
      category,
      abilities: abilityResources.map((ability) =>
        localized(ability.names, formatPokemonName(ability.name)),
      ),
      gender: genderFromRate(species.gender_rate),
      weaknesses: calculateWeaknesses(typeResources),
    }
  }

  clearCache() {
    cache.clear()
    inFlight.clear()
  }
}

export const pokemonRepository: PokemonRepository = new PokeApiRepository()
