import type { z } from 'zod'
import {
  type CatalogEntry,
  type EvolutionStage,
  type GenderBreakdown,
  isPokemonType,
  type PokemonDetail,
  type PokemonListPage,
  type PokemonSummary,
  POKEMON_TYPES,
  type PokemonTypeName,
  type Weakness,
} from '../domain/models'
import { formatPokemonName } from '../domain/formatters'
import {
  abilitySchema,
  evolutionChainSchema,
  pokemonListSchema,
  pokemonSchema,
  pokemonSpeciesSchema,
  type PokemonDto,
  type PokemonSpeciesDto,
  type PokemonTypeDto,
  typeSchema,
} from './schemas'

const API_URL = 'https://pokeapi.co/api/v2'
const DEFAULT_TTL = 30 * 60 * 1000
const STATIC_TTL = 24 * 60 * 60 * 1000

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
  listAll(): Promise<PokemonListPage>
  getSummary(name: string): Promise<PokemonSummary>
  getDetail(name: string): Promise<PokemonDetail>
  getNamesForTypes(types: PokemonTypeName[]): Promise<Set<string>>
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

function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : 0
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

interface EvolutionNode {
  species?: { name?: string; url?: string }
  evolves_to?: unknown[]
}

function flattenEvolutionChain(value: unknown): CatalogEntry[] {
  const result: CatalogEntry[] = []

  function visit(node: unknown) {
    if (!node || typeof node !== 'object') return
    const current = node as EvolutionNode
    if (current.species?.name && current.species.url) {
      result.push({ name: current.species.name, id: idFromUrl(current.species.url) })
    }
    current.evolves_to?.forEach(visit)
  }

  visit(value)
  return result
}

class PokeApiRepository implements PokemonRepository {
  async listAll(): Promise<PokemonListPage> {
    const response = await request('/pokemon?limit=100000&offset=0', pokemonListSchema, STATIC_TTL)
    return {
      count: response.count,
      entries: response.results
        .map(({ name, url }) => ({ name, id: idFromUrl(url) }))
        .filter(({ id }) => id > 0)
        .sort((left, right) => left.id - right.id),
    }
  }

  async getSummary(name: string): Promise<PokemonSummary> {
    const pokemon = await request(`/pokemon/${encodeURIComponent(name)}`, pokemonSchema)
    return toSummary(pokemon)
  }

  async getNamesForTypes(types: PokemonTypeName[]): Promise<Set<string>> {
    if (types.length === 0) return new Set()
    const resources = await Promise.all(
      types.map((type) => request(`/type/${type}`, typeSchema, STATIC_TTL)),
    )
    return new Set(resources.flatMap(({ pokemon }) => pokemon.map((entry) => entry.pokemon.name)))
  }

  async getDetail(name: string): Promise<PokemonDetail> {
    const [pokemon, species] = await Promise.all([
      request(`/pokemon/${encodeURIComponent(name)}`, pokemonSchema),
      request(`/pokemon-species/${encodeURIComponent(name)}`, pokemonSpeciesSchema, STATIC_TTL),
    ])

    const [typeResources, abilityResources, evolution] = await Promise.all([
      Promise.all(
        pokemon.types.map(({ type }) => request(`/type/${type.name}`, typeSchema, STATIC_TTL)),
      ),
      Promise.all(
        pokemon.abilities.map(({ ability }) =>
          request(`/ability/${ability.name}`, abilitySchema, STATIC_TTL),
        ),
      ),
      request(species.evolution_chain.url, evolutionChainSchema, STATIC_TTL),
    ])

    const displayName = localized(species.names, formatPokemonName(pokemon.name))
    const category = localized(
      species.genera.map(({ genus, language }) => ({
        name: genus.replace(/Pokémon\s*/i, '').trim(),
        language,
      })),
      'Sin categoría',
    )
    const evolutionEntries = flattenEvolutionChain(evolution.chain)
    const evolutionPokemon = await Promise.all(
      evolutionEntries.map(async (entry): Promise<EvolutionStage> => {
        const summary = await this.getSummary(entry.name)
        return { ...entry, displayName: summary.displayName, sprite: summary.sprite }
      }),
    )

    return {
      ...toSummary(pokemon, displayName),
      description: descriptionFromSpecies(species),
      weightHectograms: pokemon.weight,
      heightDecimeters: pokemon.height,
      category,
      abilities: abilityResources.map((ability) =>
        localized(ability.names, formatPokemonName(ability.name)),
      ),
      gender: genderFromRate(species.gender_rate),
      weaknesses: calculateWeaknesses(typeResources),
      evolutions: evolutionPokemon,
    }
  }

  clearCache() {
    cache.clear()
    inFlight.clear()
  }
}

export const pokemonRepository: PokemonRepository = new PokeApiRepository()
