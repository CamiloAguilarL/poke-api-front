import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PokemonSummary } from '@/features/pokemon/domain/models'

const repositoryMock = vi.hoisted(() => ({
  searchPage: vi.fn(),
  getSummary: vi.fn(),
}))

vi.mock('@/features/pokemon/api/pokemon-repository', () => ({
  pokemonRepository: repositoryMock,
}))

import { CATALOG_PAGE_SIZE, useCatalogStore } from '@/stores/catalog'

function summary(id: number, name: string, types: PokemonSummary['types'] = ['normal']) {
  return {
    id,
    name,
    displayName: name,
    sprite: `${name}.png`,
    artwork: `${name}-art.png`,
    types,
  } satisfies PokemonSummary
}

const bulbasaur = summary(1, 'bulbasaur', ['grass', 'poison'])
const charmander = summary(4, 'charmander', ['fire'])
const pikachu = summary(25, 'pikachu', ['electric'])

describe('catalog store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    repositoryMock.searchPage.mockReset()
    repositoryMock.getSummary.mockReset()
    repositoryMock.searchPage.mockResolvedValue({
      count: 3,
      summaries: [bulbasaur, charmander, pikachu],
      nextOffset: null,
    })
  })

  it('initializes once and sends the catalog query to the API', async () => {
    const store = useCatalogStore()
    store.setQuery('Pika')
    store.setSelectedTypes(['electric'])
    await store.initialize()
    await store.initialize()

    expect(store.status).toBe('ready')
    expect(repositoryMock.searchPage).toHaveBeenCalledOnce()
    expect(repositoryMock.searchPage).toHaveBeenCalledWith({
      query: 'Pika',
      types: ['electric'],
      limit: CATALOG_PAGE_SIZE,
      offset: 0,
    })
    expect(store.entries.map(({ name }) => name)).toEqual(['bulbasaur', 'charmander', 'pikachu'])
    expect(store.totalCount).toBe(3)
    expect(store.hasActiveFilters).toBe(true)
  })

  it('appends remote pages without duplicates and stops at the end', async () => {
    repositoryMock.searchPage
      .mockResolvedValueOnce({ count: 3, summaries: [bulbasaur, charmander], nextOffset: 2 })
      .mockResolvedValueOnce({ count: 3, summaries: [charmander, pikachu], nextOffset: null })
    const store = useCatalogStore()

    await store.initialize()
    await store.loadNextPage()
    await store.loadNextPage()

    expect(repositoryMock.searchPage).toHaveBeenCalledTimes(2)
    expect(repositoryMock.searchPage).toHaveBeenLastCalledWith({
      query: '',
      types: [],
      limit: CATALOG_PAGE_SIZE,
      offset: 2,
    })
    expect(store.entries.map(({ name }) => name)).toEqual(['bulbasaur', 'charmander', 'pikachu'])
    expect(store.hasNextPage).toBe(false)
  })

  it('hydrates only summaries that did not arrive with a catalog page', async () => {
    const store = useCatalogStore()
    repositoryMock.getSummary.mockImplementation(async (name: string) => {
      if (name === 'missing') throw new Error('missing')
      return summary(1, name)
    })

    await store.ensureSummaries(['bulbasaur', 'bulbasaur', 'missing'], 2)
    expect(repositoryMock.getSummary).toHaveBeenCalledTimes(2)
    expect(store.summaries.bulbasaur).toBeTruthy()
    expect(store.summaryErrors.missing).toBe(true)
    await store.ensureSummary('bulbasaur')
    expect(repositoryMock.getSummary).toHaveBeenCalledTimes(2)
  })

  it('reloads remotely when applying or clearing filters', async () => {
    const store = useCatalogStore()
    await store.initialize()
    repositoryMock.searchPage.mockResolvedValueOnce({
      count: 1,
      summaries: [charmander],
      nextOffset: null,
    })

    await store.applyTypes(['fire'])
    expect(repositoryMock.searchPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: '', types: ['fire'], offset: 0 }),
    )
    expect(store.entries).toEqual([{ id: 4, name: 'charmander' }])

    store.setQuery('char')
    await store.clearFilters()
    expect(repositoryMock.searchPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: '', types: [], offset: 0 }),
    )
    expect(store.filterStatus).toBe('idle')
  })

  it('exposes initial, filter, and next-page failures independently', async () => {
    const store = useCatalogStore()
    repositoryMock.searchPage.mockRejectedValueOnce(new Error('Sin conexión'))
    await store.initialize()
    expect(store.status).toBe('error')
    expect(store.errorMessage).toBe('Sin conexión')

    repositoryMock.searchPage.mockRejectedValueOnce(new Error('type failure'))
    await expect(store.applyTypes(['water'])).rejects.toThrow('type failure')
    expect(store.filterStatus).toBe('error')
    expect(store.selectedTypes).toEqual([])

    repositoryMock.searchPage
      .mockResolvedValueOnce({ count: 2, summaries: [bulbasaur], nextOffset: 1 })
      .mockRejectedValueOnce(new Error('next failure'))
    await store.initialize(true)
    await store.loadNextPage()
    expect(store.nextPageStatus).toBe('error')
  })
})
