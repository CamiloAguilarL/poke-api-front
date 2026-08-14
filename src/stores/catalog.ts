import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { pokemonRepository } from '@/features/pokemon/api/pokemon-repository'
import type {
  CatalogEntry,
  PokemonSummary,
  PokemonTypeName,
} from '@/features/pokemon/domain/models'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export const useCatalogStore = defineStore('catalog', () => {
  const entries = ref<CatalogEntry[]>([])
  const summaries = reactive<Record<string, PokemonSummary>>({})
  const summaryErrors = reactive<Record<string, boolean>>({})
  const loadingNames = reactive(new Set<string>())
  const query = ref('')
  const selectedTypes = ref<PokemonTypeName[]>([])
  const typeNames = ref<Set<string>>(new Set())
  const status = ref<LoadStatus>('idle')
  const filterStatus = ref<LoadStatus>('idle')
  const errorMessage = ref('')

  const filteredEntries = computed(() => {
    const normalizedQuery = query.value.trim().toLocaleLowerCase('es')
    return entries.value.filter((entry) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        entry.name.includes(normalizedQuery) ||
        String(entry.id).startsWith(normalizedQuery.replace(/^0+/, ''))
      const matchesType = selectedTypes.value.length === 0 || typeNames.value.has(entry.name)
      return matchesQuery && matchesType
    })
  })

  const hasActiveFilters = computed(
    () => query.value.trim().length > 0 || selectedTypes.value.length > 0,
  )

  async function initialize(force = false) {
    if (!force && (status.value === 'loading' || status.value === 'ready')) return
    status.value = 'loading'
    errorMessage.value = ''
    try {
      const page = await pokemonRepository.listAll()
      entries.value = page.entries
      status.value = 'ready'
    } catch (error) {
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'No pudimos cargar la Pokédex.'
    }
  }

  async function ensureSummary(name: string) {
    if (summaries[name] || loadingNames.has(name)) return
    loadingNames.add(name)
    delete summaryErrors[name]
    try {
      summaries[name] = await pokemonRepository.getSummary(name)
    } catch {
      summaryErrors[name] = true
    } finally {
      loadingNames.delete(name)
    }
  }

  async function ensureSummaries(names: string[], concurrency = 6) {
    const queue = [...new Set(names)].filter((name) => !summaries[name] && !loadingNames.has(name))
    let cursor = 0
    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (cursor < queue.length) {
        const name = queue[cursor]
        cursor += 1
        if (name) await ensureSummary(name)
      }
    })
    await Promise.all(workers)
  }

  function setQuery(value: string) {
    query.value = value
  }

  async function applyTypes(types: PokemonTypeName[]) {
    filterStatus.value = 'loading'
    try {
      typeNames.value = await pokemonRepository.getNamesForTypes(types)
      selectedTypes.value = [...types]
      filterStatus.value = 'ready'
    } catch (error) {
      filterStatus.value = 'error'
      throw error
    }
  }

  function clearFilters() {
    query.value = ''
    selectedTypes.value = []
    typeNames.value = new Set()
    filterStatus.value = 'idle'
  }

  return {
    entries,
    summaries,
    summaryErrors,
    loadingNames,
    query,
    selectedTypes,
    status,
    filterStatus,
    errorMessage,
    filteredEntries,
    hasActiveFilters,
    initialize,
    ensureSummary,
    ensureSummaries,
    setQuery,
    applyTypes,
    clearFilters,
  }
})
