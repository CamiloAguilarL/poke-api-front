import type { Page, Route } from '@playwright/test'

interface PokemonFixture {
  id: number
  name: string
  types: string[]
}

const pokemon: PokemonFixture[] = [
  { id: 1, name: 'bulbasaur', types: ['grass', 'poison'] },
  { id: 2, name: 'ivysaur', types: ['grass', 'poison'] },
  { id: 3, name: 'venusaur', types: ['grass', 'poison'] },
  { id: 4, name: 'charmander', types: ['fire'] },
  { id: 5, name: 'charmeleon', types: ['fire'] },
  { id: 6, name: 'charizard', types: ['fire', 'flying'] },
  { id: 7, name: 'squirtle', types: ['water'] },
  { id: 8, name: 'wartortle', types: ['water'] },
  { id: 9, name: 'blastoise', types: ['water'] },
  { id: 10, name: 'caterpie', types: ['bug'] },
  { id: 11, name: 'metapod', types: ['bug'] },
  { id: 12, name: 'butterfree', types: ['bug', 'flying'] },
  { id: 25, name: 'pikachu', types: ['electric'] },
  { id: 39, name: 'jigglypuff', types: ['normal', 'fairy'] },
]

const named = (name: string, resource: string) => ({
  name,
  url: `https://pokeapi.co/api/v2/${resource}/${name}/`,
})

function pokemonResponse(entry: PokemonFixture) {
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`
  const crystalSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/${entry.id}.png`
  const artwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`
  return {
    id: entry.id,
    name: entry.name,
    height: entry.name === 'bulbasaur' ? 7 : 4,
    weight: entry.name === 'bulbasaur' ? 69 : 60,
    types: entry.types.map((type, index) => ({ slot: index + 1, type: named(type, 'type') })),
    abilities: [
      { ability: named('overgrow', 'ability'), is_hidden: false, slot: 1 },
      { ability: named('chlorophyll', 'ability'), is_hidden: true, slot: 3 },
    ],
    sprites: {
      front_default: sprite,
      versions: {
        'generation-ii': { crystal: { front_default: crystalSprite } },
        'generation-v': { 'black-white': { front_default: sprite } },
      },
      other: { 'official-artwork': { front_default: artwork } },
    },
  }
}

function typeResponse(type: string) {
  const doubleDamageFrom =
    type === 'grass'
      ? ['fire', 'ice', 'poison', 'flying', 'bug']
      : type === 'poison'
        ? ['ground', 'psychic']
        : ['ground']
  const halfDamageFrom =
    type === 'grass'
      ? ['water', 'electric', 'grass', 'ground']
      : type === 'poison'
        ? ['fighting', 'poison', 'bug', 'grass', 'fairy']
        : []
  return {
    name: type,
    names: [{ name: type, language: named('es', 'language') }],
    damage_relations: {
      double_damage_from: doubleDamageFrom.map((name) => named(name, 'type')),
      half_damage_from: halfDamageFrom.map((name) => named(name, 'type')),
      no_damage_from: [],
    },
    pokemon: pokemon
      .filter((entry) => entry.types.includes(type))
      .map((entry) => ({ pokemon: named(entry.name, 'pokemon') })),
  }
}

async function fulfillJson(route: Route, json: unknown, status = 200) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) })
}

export async function mockPokeApi(
  page: Page,
  options: {
    failList?: boolean
    failListAttempts?: number
    listDelayMs?: number
    pageSizeCap?: number
  } = {},
) {
  const catalogRequests: Array<{ limit: number; offset: number; where: Record<string, any> }> = []
  let listAttempts = 0

  await page.route('https://graphql.pokeapi.co/v1beta2', async (route) => {
    if (options.listDelayMs)
      await new Promise((resolve) => setTimeout(resolve, options.listDelayMs))
    listAttempts += 1
    if (options.failList || listAttempts <= (options.failListAttempts ?? 0)) {
      return fulfillJson(route, { errors: [{ message: 'unavailable' }] }, 503)
    }

    const body = route.request().postDataJSON() as {
      variables: { limit: number; offset: number; where: Record<string, any> }
    }
    const { where, offset } = body.variables
    const limit = options.pageSizeCap
      ? Math.min(body.variables.limit, options.pageSizeCap)
      : body.variables.limit
    catalogRequests.push({ limit: body.variables.limit, offset, where })

    const clauses = Array.isArray(where._and) ? where._and : []
    const searchClause = clauses.find(
      (clause: Record<string, any>) => clause.name?._ilike || clause._or,
    )
    const namePattern = searchClause?.name?._ilike ?? searchClause?._or?.[0]?.name?._ilike ?? ''
    const query = String(namePattern).replaceAll('%', '').replaceAll('\\', '')
    const id = searchClause?._or?.[1]?.id?._eq
    const typeClause = clauses.find((clause: Record<string, any>) => clause.pokemontypes)
    const types: string[] = typeClause?.pokemontypes?.type?.name?._in ?? []
    const filtered = pokemon.filter(
      (entry) =>
        (!query || entry.name.includes(query) || entry.id === id) &&
        (!types.length || entry.types.some((type) => types.includes(type))),
    )
    const pageEntries = filtered.slice(offset, offset + limit)

    return fulfillJson(route, {
      data: {
        pokemon_aggregate: { aggregate: { count: filtered.length } },
        pokemon: pageEntries.map((entry) => ({
          id: entry.id,
          name: entry.name,
          pokemontypes: entry.types.map((type) => ({ type: { name: type } })),
        })),
      },
    })
  })

  await page.route('https://pokeapi.co/api/v2/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname.replace('/api/v2/', '').replace(/\/$/, '')

    if (path === 'pokemon') {
      if (options.listDelayMs)
        await new Promise((resolve) => setTimeout(resolve, options.listDelayMs))
      if (options.failList) return fulfillJson(route, { detail: 'unavailable' }, 503)
      return fulfillJson(route, {
        count: pokemon.length,
        results: pokemon.map((entry) => ({
          name: entry.name,
          url: `https://pokeapi.co/api/v2/pokemon/${entry.id}/`,
        })),
      })
    }

    if (path.startsWith('pokemon-species/')) {
      const name = path.split('/')[1] ?? 'bulbasaur'
      return fulfillJson(route, {
        name,
        gender_rate: 1,
        names: [
          { name: name === 'bulbasaur' ? 'Bulbasaur' : name, language: named('es', 'language') },
        ],
        flavor_text_entries: [
          {
            flavor_text:
              'Una rara semilla le fue plantada en el lomo al nacer. La planta brota y crece con este Pokémon.',
            language: named('es', 'language'),
          },
        ],
        genera: [{ genus: 'Pokémon Semilla', language: named('es', 'language') }],
        evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
      })
    }

    if (path.startsWith('pokemon/')) {
      const name = path.split('/')[1]
      const entry = pokemon.find((item) => item.name === name)
      return entry
        ? fulfillJson(route, pokemonResponse(entry))
        : fulfillJson(route, { detail: 'not found' }, 404)
    }

    if (path.startsWith('type/'))
      return fulfillJson(route, typeResponse(path.split('/')[1] ?? 'normal'))
    if (path.startsWith('ability/')) {
      const name = path.split('/')[1] ?? 'overgrow'
      return fulfillJson(route, {
        name,
        names: [
          {
            name: name === 'overgrow' ? 'Espesura' : 'Clorofila',
            language: named('es', 'language'),
          },
        ],
      })
    }
    if (path === 'evolution-chain/1') {
      return fulfillJson(route, {
        chain: {
          species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
          evolves_to: [
            {
              species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
              evolves_to: [
                {
                  species: {
                    name: 'venusaur',
                    url: 'https://pokeapi.co/api/v2/pokemon-species/3/',
                  },
                  evolves_to: [],
                },
              ],
            },
          ],
        },
      })
    }
    return fulfillJson(route, { detail: 'not mocked' }, 404)
  })

  return { catalogRequests }
}

export async function startOnCatalog(page: Page, favoriteNames: string[] = []) {
  await page.addInitScript((names) => {
    localStorage.setItem(
      'global66-pokedex:preferences',
      JSON.stringify({ version: 1, state: { onboardingComplete: true } }),
    )
    if (names.length) {
      localStorage.setItem(
        'global66-pokedex:favorites',
        JSON.stringify({ version: 1, state: { names, lastRemoved: null } }),
      )
    }
  }, favoriteNames)
}
