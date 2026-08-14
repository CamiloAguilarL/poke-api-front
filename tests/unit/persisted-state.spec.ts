import { createPinia, defineStore, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'
import { persistedStatePlugin } from '@/stores/persisted-state'

function createStore(id = 'favorites') {
  const pinia = createPinia().use(persistedStatePlugin)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return defineStore(id, { state: () => ({ names: [] as string[] }) })()
}

describe('persisted state plugin', () => {
  it('hydrates valid versioned state and writes subsequent changes', async () => {
    localStorage.setItem(
      'global66-pokedex:favorites',
      JSON.stringify({ version: 1, state: { names: ['pikachu'] } }),
    )
    const store = createStore()
    expect(store.names).toEqual(['pikachu'])
    store.names.push('eevee')
    await Promise.resolve()
    expect(JSON.parse(localStorage.getItem('global66-pokedex:favorites') ?? '{}')).toEqual({
      version: 1,
      state: { names: ['pikachu', 'eevee'] },
    })
  })

  it('removes malformed state and ignores stores outside the allowlist', () => {
    localStorage.setItem('global66-pokedex:favorites', '{oops')
    createStore()
    expect(localStorage.getItem('global66-pokedex:favorites')).toBeNull()
    const catalog = createStore('catalog')
    catalog.names.push('bulbasaur')
    expect(localStorage.getItem('global66-pokedex:catalog')).toBeNull()
  })

  it('ignores state from a different persistence version', () => {
    localStorage.setItem(
      'global66-pokedex:favorites',
      JSON.stringify({ version: 0, state: { names: ['pikachu'] } }),
    )
    expect(createStore().names).toEqual([])
  })
})
