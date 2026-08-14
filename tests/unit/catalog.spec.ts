import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PokemonSummary } from '@/features/pokemon/domain/models'

const repositoryMock = vi.hoisted(() => ({
  listAll: vi.fn(),
  getSummary: vi.fn(),
  getNamesForTypes: vi.fn(),
}))

vi.mock('@/features/pokemon/api/pokemon-repository', () => ({
  pokemonRepository: repositoryMock,
}))

import { useCatalogStore } from '@/stores/catalog'

const bulbasaur: PokemonSummary = {
  id: 1,
  name: 'bulbasaur',
  displayName: 'Bulbasaur',
  sprite: 'sprite.png',
  artwork: 'artwork.png',
  types: ['grass', 'poison'],
}

describe('catalog store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    repositoryMock.listAll.mockReset()
    repositoryMock.getSummary.mockReset()
    repositoryMock.getNamesForTypes.mockReset()
    repositoryMock.listAll.mockResolvedValue({
      count: 3,
      entries: [
        { id: 1, name: 'bulbasaur' },
        { id: 4, name: 'charmander' },
        { id: 25, name: 'pikachu' },
      ],
    })
  })

  it('initializes once and supports name or zero-padded id search', async () => {
    const store = useCatalogStore()
    await store.initialize()
    await store.initialize()
    expect(store.status).toBe('ready')
    expect(repositoryMock.listAll).toHaveBeenCalledOnce()
    store.setQuery('Pika')
    expect(store.filteredEntries.map(({ name }) => name)).toEqual(['pikachu'])
    store.setQuery('004')
    expect(store.filteredEntries.map(({ name }) => name)).toEqual(['charmander'])
    expect(store.hasActiveFilters).toBe(true)
  })

  it('hydrates summaries once, records failures and avoids duplicate work', async () => {
    const store = useCatalogStore()
    repositoryMock.getSummary.mockImplementation(async (name: string) => {
      if (name === 'missing') throw new Error('missing')
      return { ...bulbasaur, name, displayName: name }
    })
    await store.ensureSummaries(['bulbasaur', 'bulbasaur', 'missing'], 2)
    expect(repositoryMock.getSummary).toHaveBeenCalledTimes(2)
    expect(store.summaries.bulbasaur).toBeTruthy()
    expect(store.summaryErrors.missing).toBe(true)
    await store.ensureSummary('bulbasaur')
    expect(repositoryMock.getSummary).toHaveBeenCalledTimes(2)
  })

  it('combines text with selected types and clears every filter', async () => {
    const store = useCatalogStore()
    await store.initialize()
    repositoryMock.getNamesForTypes.mockResolvedValue(new Set(['charmander', 'bulbasaur']))
    await store.applyTypes(['fire', 'grass'])
    expect(store.selectedTypes).toEqual(['fire', 'grass'])
    expect(store.filteredEntries).toHaveLength(2)
    store.setQuery('char')
    expect(store.filteredEntries.map(({ name }) => name)).toEqual(['charmander'])
    store.clearFilters()
    expect(store.filteredEntries).toHaveLength(3)
    expect(store.filterStatus).toBe('idle')
  })

  it('exposes catalog and type-filter failures for retry UI', async () => {
    const store = useCatalogStore()
    repositoryMock.listAll.mockRejectedValueOnce(new Error('Sin conexión'))
    await store.initialize()
    expect(store.status).toBe('error')
    expect(store.errorMessage).toBe('Sin conexión')
    repositoryMock.getNamesForTypes.mockRejectedValueOnce(new Error('type failure'))
    await expect(store.applyTypes(['water'])).rejects.toThrow('type failure')
    expect(store.filterStatus).toBe('error')
  })
})
