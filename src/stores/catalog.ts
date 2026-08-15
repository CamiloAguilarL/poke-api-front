import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { pokemonRepository } from '@/features/pokemon/api/pokemon-repository'
import type {
  CatalogEntry,
  PokemonSummary,
  PokemonSummaryPage,
  PokemonTypeName,
} from '@/features/pokemon/domain/models'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export const CATALOG_PAGE_SIZE = 40

export const useCatalogStore = defineStore('catalog', () => {
  const entries = ref<CatalogEntry[]>([])
  const summaries = reactive<Record<string, PokemonSummary>>({})
  const summaryErrors = reactive<Record<string, boolean>>({})
  const loadingNames = reactive(new Set<string>())
  const query = ref('')
  const selectedTypes = ref<PokemonTypeName[]>([])
  const status = ref<LoadStatus>('idle')
  const filterStatus = ref<LoadStatus>('idle')
  const nextPageStatus = ref<LoadStatus>('idle')
  const errorMessage = ref('')
  const totalCount = ref(0)
  const nextOffset = ref<number | null>(0)
  const resultVersion = ref(0)
  let requestVersion = 0

  const hasActiveFilters = computed(
    () => query.value.trim().length > 0 || selectedTypes.value.length > 0,
  )
  const hasNextPage = computed(() => nextOffset.value !== null)

  function applyPage(page: PokemonSummaryPage, reset: boolean) {
    page.summaries.forEach((summary) => {
      summaries[summary.name] = summary
      delete summaryErrors[summary.name]
    })

    const pageEntries = page.summaries.map(({ id, name }) => ({ id, name }))
    if (reset) {
      entries.value = pageEntries
      resultVersion.value += 1
    } else {
      const knownNames = new Set(entries.value.map(({ name }) => name))
      entries.value.push(...pageEntries.filter(({ name }) => !knownNames.has(name)))
    }
    totalCount.value = page.count
    nextOffset.value = page.nextOffset
  }

  async function replaceResults() {
    const version = ++requestVersion
    status.value = 'loading'
    nextPageStatus.value = 'idle'
    errorMessage.value = ''

    try {
      const page = await pokemonRepository.searchPage({
        query: query.value,
        types: selectedTypes.value,
        limit: CATALOG_PAGE_SIZE,
        offset: 0,
      })
      if (version !== requestVersion) return
      applyPage(page, true)
      status.value = 'ready'
    } catch (error) {
      if (version !== requestVersion) return
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'No pudimos cargar la Pokédex.'
      throw error
    }
  }

  async function initialize(force = false) {
    if (!force && (status.value === 'loading' || status.value === 'ready')) return
    try {
      await replaceResults()
    } catch {
      // The view renders the store error and exposes its retry action.
    }
  }

  async function reload() {
    try {
      await replaceResults()
    } catch {
      // Search errors use the same recoverable catalog error state.
    }
  }

  async function loadNextPage() {
    if (
      status.value !== 'ready' ||
      nextPageStatus.value === 'loading' ||
      nextOffset.value === null
    ) {
      return
    }

    const version = requestVersion
    const offset = nextOffset.value
    nextPageStatus.value = 'loading'
    try {
      const page = await pokemonRepository.searchPage({
        query: query.value,
        types: selectedTypes.value,
        limit: CATALOG_PAGE_SIZE,
        offset,
      })
      if (version !== requestVersion) return
      applyPage(page, false)
      nextPageStatus.value = 'ready'
    } catch {
      if (version === requestVersion) nextPageStatus.value = 'error'
    }
  }

  async function ensureSummaries(names: string[]) {
    const queue = [...new Set(names)].filter((name) => !summaries[name] && !loadingNames.has(name))
    if (!queue.length) return

    queue.forEach((name) => {
      loadingNames.add(name)
      delete summaryErrors[name]
    })

    try {
      const hydrated = await pokemonRepository.getSummaries(queue)
      const hydratedNames = new Set(hydrated.map(({ name }) => name))
      hydrated.forEach((summary) => {
        summaries[summary.name] = summary
      })
      queue.forEach((name) => {
        if (!hydratedNames.has(name)) summaryErrors[name] = true
      })
    } catch {
      queue.forEach((name) => {
        summaryErrors[name] = true
      })
    } finally {
      queue.forEach((name) => loadingNames.delete(name))
    }
  }

  function setQuery(value: string) {
    query.value = value
  }

  function setSelectedTypes(types: PokemonTypeName[]) {
    selectedTypes.value = [...types]
  }

  async function applyTypes(types: PokemonTypeName[]) {
    const previousTypes = [...selectedTypes.value]
    selectedTypes.value = [...types]
    filterStatus.value = 'loading'
    try {
      await replaceResults()
      filterStatus.value = 'ready'
    } catch (error) {
      selectedTypes.value = previousTypes
      filterStatus.value = 'error'
      throw error
    }
  }

  async function clearFilters() {
    query.value = ''
    selectedTypes.value = []
    filterStatus.value = 'idle'
    await reload()
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
    nextPageStatus,
    errorMessage,
    totalCount,
    resultVersion,
    hasActiveFilters,
    hasNextPage,
    initialize,
    reload,
    loadNextPage,
    ensureSummaries,
    setQuery,
    setSelectedTypes,
    applyTypes,
    clearFilters,
  }
})
