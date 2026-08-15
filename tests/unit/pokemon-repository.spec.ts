import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PokeApiError, pokemonRepository } from '@/features/pokemon/api/pokemon-repository'

function response(json: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => json } as Response
}

describe('pokemon repository catalog', () => {
  beforeEach(() => {
    pokemonRepository.clearCache()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => vi.unstubAllGlobals())

  it('sends pagination, partial search and types to GraphQL and caches the page', async () => {
    vi.mocked(fetch).mockResolvedValue(
      response({
        data: {
          pokemon_aggregate: { aggregate: { count: 1 } },
          pokemon: [
            {
              id: 1,
              name: 'bulbasaur',
              pokemontypes: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
            },
          ],
        },
      }),
    )

    const request = { query: 'Bulb', types: ['grass'] as const, limit: 40, offset: 80 }
    const page = await pokemonRepository.searchPage({ ...request, types: [...request.types] })
    const cachedPage = await pokemonRepository.searchPage({ ...request, types: [...request.types] })

    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith(
      'https://graphql.pokeapi.co/v1beta2',
      expect.objectContaining({ method: 'POST' }),
    )
    const init = vi.mocked(fetch).mock.calls[0]?.[1]
    const body = JSON.parse(String(init?.body))
    expect(body.variables).toEqual({
      limit: 40,
      offset: 80,
      where: {
        is_default: { _eq: true },
        _and: [
          { name: { _ilike: '%bulb%' } },
          { pokemontypes: { type: { name: { _in: ['grass'] } } } },
        ],
      },
    })
    expect(page).toEqual({
      count: 1,
      nextOffset: null,
      summaries: [
        expect.objectContaining({
          id: 1,
          name: 'bulbasaur',
          sprite: expect.stringContaining('/pokemon/1.png'),
          types: ['grass', 'poison'],
        }),
      ],
    })
    expect(cachedPage).toEqual(page)
  })

  it('matches a numeric query by id and surfaces GraphQL failures', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        response({
          data: {
            pokemon_aggregate: { aggregate: { count: 0 } },
            pokemon: [],
          },
        }),
      )
      .mockResolvedValueOnce(response({ errors: [{ message: 'rate limit exceeded' }] }))

    await pokemonRepository.searchPage({ query: '001', types: [], limit: 20, offset: 0 })
    const firstBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body))
    expect(firstBody.variables.where._and[0]._or).toEqual([
      { name: { _ilike: '%001%' } },
      { id: { _eq: 1 } },
    ])

    const rejectedPage = pokemonRepository.searchPage({
      query: 'missing',
      types: [],
      limit: 20,
      offset: 0,
    })
    await expect(rejectedPage).rejects.toBeInstanceOf(PokeApiError)
    await expect(rejectedPage).rejects.toThrow('rate limit exceeded')
  })

  it('hydrates favorite summaries in deduplicated GraphQL batches', async () => {
    vi.mocked(fetch).mockResolvedValue(
      response({
        data: {
          pokemon_aggregate: { aggregate: { count: 2 } },
          pokemon: [
            {
              id: 1,
              name: 'bulbasaur',
              pokemontypes: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
            },
            {
              id: 4,
              name: 'charmander',
              pokemontypes: [{ type: { name: 'fire' } }],
            },
          ],
        },
      }),
    )

    const summaries = await pokemonRepository.getSummaries([
      'Bulbasaur',
      'charmander',
      'bulbasaur',
      ' ',
    ])

    expect(fetch).toHaveBeenCalledOnce()
    const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body))
    expect(body.query).toContain('query Summaries')
    expect(body.variables).toEqual({
      where: {
        is_default: { _eq: true },
        name: { _in: ['bulbasaur', 'charmander'] },
      },
    })
    expect(summaries.map(({ name }) => name)).toEqual(['bulbasaur', 'charmander'])
  })
})
