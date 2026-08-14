import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFavoritesStore } from '@/stores/favorites'

describe('favorites store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('adds unique names and toggles them', () => {
    const store = useFavoritesStore()
    store.add('bulbasaur')
    store.add('bulbasaur')
    expect(store.names).toEqual(['bulbasaur'])
    expect(store.count).toBe(1)
    expect(store.has('bulbasaur')).toBe(true)
    expect(store.toggle('bulbasaur')).toBe(false)
    expect(store.names).toEqual([])
    expect(store.toggle('pikachu')).toBe(true)
    expect(store.names).toEqual(['pikachu'])
  })

  it('preserves ordering when undoing a deletion', () => {
    const store = useFavoritesStore()
    store.names = ['bulbasaur', 'charmander', 'squirtle']
    expect(store.remove('charmander')).toBe(true)
    expect(store.names).toEqual(['bulbasaur', 'squirtle'])
    expect(store.lastRemoved).toEqual({ index: 1, name: 'charmander' })
    expect(store.undoRemove()).toBe(true)
    expect(store.names).toEqual(['bulbasaur', 'charmander', 'squirtle'])
    expect(store.undoRemove()).toBe(false)
    expect(store.remove('missing')).toBe(false)
  })
})
