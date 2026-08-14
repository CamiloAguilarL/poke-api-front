import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface RemovedFavorite {
  index: number
  name: string
}

export const useFavoritesStore = defineStore('favorites', () => {
  const names = ref<string[]>([])
  const lastRemoved = ref<RemovedFavorite | null>(null)
  const count = computed(() => names.value.length)

  function has(name: string) {
    return names.value.includes(name)
  }

  function add(name: string) {
    if (!has(name)) names.value.push(name)
    lastRemoved.value = null
  }

  function remove(name: string) {
    const index = names.value.indexOf(name)
    if (index === -1) return false
    names.value.splice(index, 1)
    lastRemoved.value = { index, name }
    return true
  }

  function toggle(name: string) {
    if (has(name)) {
      remove(name)
      return false
    }
    add(name)
    return true
  }

  function undoRemove() {
    if (!lastRemoved.value || has(lastRemoved.value.name)) return false
    names.value.splice(lastRemoved.value.index, 0, lastRemoved.value.name)
    lastRemoved.value = null
    return true
  }

  return { names, count, lastRemoved, has, add, remove, toggle, undoRemove }
})
