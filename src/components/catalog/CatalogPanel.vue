<script setup lang="ts">
import { Search, SlidersHorizontal } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { SearchField } from '@/components/ui/search-field'
import ErrorState from '@/components/states/ErrorState.vue'
import PokeballLoader from '@/components/PokeballLoader.vue'
import PokemonVirtualList from '@/components/pokemon/PokemonVirtualList.vue'
import { isPokemonType, type PokemonTypeName } from '@/features/pokemon/domain/models'
import { useCatalogStore } from '@/stores/catalog'
import FilterSheet from './FilterSheet.vue'

const store = useCatalogStore()
const route = useRoute()
const router = useRouter()
const {
  summaries,
  query,
  selectedTypes,
  status,
  filterStatus,
  errorMessage,
  filteredEntries,
  hasActiveFilters,
} = storeToRefs(store)
const filterOpen = ref(false)

const resultLabel = computed(() => {
  const count = filteredEntries.value.length
  if (!hasActiveFilters.value) return `${count.toLocaleString('es-CO')} Pokémon`
  return `${count.toLocaleString('es-CO')} resultado${count === 1 ? '' : 's'}`
})

function typesFromRoute(): PokemonTypeName[] {
  const value = typeof route.query.types === 'string' ? route.query.types.split(',') : []
  return [...new Set(value.filter(isPokemonType))]
}

async function updateRoute() {
  const types = selectedTypes.value.join(',')
  const nextQuery = query.value.trim()
  await router.replace({
    query: {
      ...(nextQuery ? { q: nextQuery } : {}),
      ...(types ? { types } : {}),
    },
  })
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(query, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => void updateRoute(), 200)
})

async function applyTypes(types: PokemonTypeName[]) {
  try {
    await store.applyTypes(types)
    filterOpen.value = false
    await updateRoute()
  } catch {
    toast.error('No pudimos aplicar el filtro. Inténtalo nuevamente.')
  }
}

async function clearFilters() {
  store.clearFilters()
  await updateRoute()
}

async function retry() {
  await store.initialize(true)
}

onMounted(async () => {
  const routeQuery = typeof route.query.q === 'string' ? route.query.q : ''
  store.setQuery(routeQuery)
  await store.initialize()
  const types = typesFromRoute()
  if (types.length > 0) {
    try {
      await store.applyTypes(types)
    } catch {
      toast.error('El catálogo cargó, pero no pudimos recuperar los filtros.')
    }
  }
})
</script>

<template>
  <section
    class="flex h-[calc(100dvh-77px)] min-h-[560px] flex-col bg-background lg:h-dvh"
    aria-label="Catálogo Pokémon"
  >
    <header class="shrink-0 px-4 pb-3 pt-11 lg:px-6 lg:pt-7">
      <div class="flex items-center gap-2">
        <SearchField
          :model-value="query"
          label="Buscar Pokémon"
          placeholder="Buscar Pokémon..."
          test-id="pokemon-search"
          class="flex-1"
          @update:model-value="store.setQuery"
        />
        <Button
          variant="secondary"
          size="icon"
          class="relative"
          aria-label="Filtrar por tipo"
          data-testid="open-filters"
          @click="filterOpen = true"
        >
          <SlidersHorizontal class="size-5" />
          <span
            v-if="selectedTypes.length"
            class="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
          >
            {{ selectedTypes.length }}
          </span>
        </Button>
      </div>

      <div v-if="status === 'ready'" class="mt-4 flex h-6 items-center justify-between">
        <p class="text-xs font-medium text-muted-foreground" aria-live="polite">
          {{ resultLabel }}
        </p>
        <Button
          v-if="hasActiveFilters"
          variant="tertiary"
          size="sm"
          class="h-7 px-2"
          @click="clearFilters"
        >
          Borrar filtros
        </Button>
      </div>
    </header>

    <PokeballLoader
      v-if="status === 'loading' || status === 'idle'"
      fullscreen
      class="fixed inset-0 z-50"
    />
    <ErrorState
      v-else-if="status === 'error'"
      class="flex-1"
      :description="errorMessage"
      @retry="retry"
    />
    <div
      v-else-if="filteredEntries.length === 0"
      class="flex flex-1 flex-col items-center justify-center px-8 text-center"
    >
      <div class="flex size-20 items-center justify-center rounded-full bg-[var(--surface-info)]">
        <Search class="size-9 text-primary" />
      </div>
      <h2 class="mt-5 text-lg font-semibold">No encontramos Pokémon</h2>
      <p class="mt-2 text-sm leading-6 text-muted-foreground">
        Prueba con otro nombre, número o combinación de tipos.
      </p>
      <Button class="mt-5" variant="secondary" @click="clearFilters">Borrar filtros</Button>
    </div>
    <div v-else class="min-h-0 flex-1 px-4 lg:px-6">
      <PokemonVirtualList
        :entries="filteredEntries"
        :summaries="summaries"
        @visible="store.ensureSummaries"
      />
    </div>

    <FilterSheet
      v-model:open="filterOpen"
      :selected="selectedTypes"
      :loading="filterStatus === 'loading'"
      @apply="applyTypes"
    />
  </section>
</template>
