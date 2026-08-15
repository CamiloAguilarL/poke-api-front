import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PokemonSummary } from '@/features/pokemon/domain/models'

const repositoryMock = vi.hoisted(() => ({
  searchPage: vi.fn(),
  getSummaries: vi.fn(),
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
    repositoryMock.getSummaries.mockReset()
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
    repositoryMock.getSummaries.mockResolvedValue([bulbasaur])

    await store.ensureSummaries(['bulbasaur', 'bulbasaur', 'missing'])
    expect(repositoryMock.getSummaries).toHaveBeenCalledOnce()
    expect(repositoryMock.getSummaries).toHaveBeenCalledWith(['bulbasaur', 'missing'])
    expect(store.summaries.bulbasaur).toBeTruthy()
    expect(store.summaryErrors.missing).toBe(true)
    await store.ensureSummaries(['bulbasaur'])
    expect(repositoryMock.getSummaries).toHaveBeenCalledOnce()
  })

  it('marks the entire pending batch when favorite hydration fails', async () => {
    const store = useCatalogStore()
    repositoryMock.getSummaries.mockRejectedValue(new Error('offline'))

    await store.ensureSummaries(['bulbasaur', 'charmander'])

    expect(store.summaryErrors).toMatchObject({ bulbasaur: true, charmander: true })
    expect(store.loadingNames.size).toBe(0)
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

  it('ignores stale first and next-page responses after a newer search', async () => {
    let resolveInitial!: (value: unknown) => void
    let resolveNext!: (value: unknown) => void
    repositoryMock.searchPage
      .mockImplementationOnce(() => new Promise((resolve) => (resolveInitial = resolve)))
      .mockResolvedValueOnce({ count: 2, summaries: [charmander], nextOffset: 1 })
      .mockImplementationOnce(() => new Promise((resolve) => (resolveNext = resolve)))
      .mockResolvedValueOnce({ count: 1, summaries: [pikachu], nextOffset: null })

    const store = useCatalogStore()
    const initialRequest = store.initialize()
    store.setQuery('char')
    await store.reload()
    resolveInitial({ count: 1, summaries: [bulbasaur], nextOffset: null })
    await initialRequest
    expect(store.entries).toEqual([{ id: 4, name: 'charmander' }])

    const nextRequest = store.loadNextPage()
    store.setQuery('pika')
    await store.reload()
    resolveNext({ count: 2, summaries: [bulbasaur], nextOffset: null })
    await nextRequest
    expect(store.entries).toEqual([{ id: 25, name: 'pikachu' }])
  })

  it('guards duplicate page requests and uses a safe fallback for unknown errors', async () => {
    const store = useCatalogStore()
    await store.loadNextPage()
    expect(repositoryMock.searchPage).not.toHaveBeenCalled()

    repositoryMock.searchPage.mockRejectedValueOnce('offline')
    await store.initialize()
    expect(store.errorMessage).toBe('No pudimos cargar la Pokédex.')

    let resolvePage!: (value: unknown) => void
    repositoryMock.searchPage
      .mockResolvedValueOnce({ count: 2, summaries: [bulbasaur], nextOffset: 1 })
      .mockImplementationOnce(() => new Promise((resolve) => (resolvePage = resolve)))
    await store.initialize(true)
    const pendingPage = store.loadNextPage()
    await store.loadNextPage()
    expect(repositoryMock.searchPage).toHaveBeenCalledTimes(3)
    resolvePage({ count: 2, summaries: [pikachu], nextOffset: null })
    await pendingPage
  })
})
