import type { PiniaPluginContext, StateTree } from 'pinia'

const VERSION = 1
const PERSISTED_STORES = new Set(['favorites', 'preferences'])

interface StoredState {
  version: number
  state: StateTree
}

export function persistedStatePlugin({ store }: PiniaPluginContext) {
  if (!PERSISTED_STORES.has(store.$id) || typeof localStorage === 'undefined') return

  const key = `global66-pokedex:${store.$id}`
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as StoredState
      if (parsed.version === VERSION && parsed.state) store.$patch(parsed.state)
    } catch {
      localStorage.removeItem(key)
    }
  }

  store.$subscribe(
    (_mutation, state) => {
      localStorage.setItem(key, JSON.stringify({ version: VERSION, state } satisfies StoredState))
    },
    { detached: true },
  )
}
