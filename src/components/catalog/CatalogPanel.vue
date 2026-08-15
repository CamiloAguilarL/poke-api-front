<script setup lang="ts">
import { Search } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from '@/components/ui/sonner'
import ContentContainer from '@/components/layout/ContentContainer.vue'
import { Button } from '@/components/ui/button'
import { SearchField } from '@/components/ui/search-field'
import { ProgressBar } from '@/components/ui/progress'
import ErrorState from '@/components/states/ErrorState.vue'
import PokeballLoader from '@/components/PokeballLoader.vue'
import PokemonVirtualList from '@/components/pokemon/PokemonVirtualList.vue'
import { isPokemonType, type PokemonTypeName } from '@/features/pokemon/domain/models'
import { useCatalogStore } from '@/stores/catalog'
import FilterSheet from './FilterSheet.vue'

const store = useCatalogStore()
const props = withDefaults(defineProps<{ expanded?: boolean }>(), { expanded: false })
const route = useRoute()
const router = useRouter()
const {
  summaries,
  query,
  selectedTypes,
  status,
  filterStatus,
  nextPageStatus,
  entries,
  totalCount,
  hasActiveFilters,
  resultVersion,
  hasNextPage,
} = storeToRefs(store)
const filterOpen = ref(false)
const catalogReady = ref(false)
const suppressSearch = ref(false)
const initialLoading = computed(
  () => status.value === 'idle' || (status.value === 'loading' && entries.value.length === 0),
)
const refreshing = computed(() => status.value === 'loading' && entries.value.length > 0)

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
  if (!catalogReady.value || suppressSearch.value) return
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void Promise.all([updateRoute(), store.reload()])
  }, 350)
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
  suppressSearch.value = true
  await store.clearFilters()
  await updateRoute()
  await nextTick()
  suppressSearch.value = false
}

async function retry() {
  await store.initialize(true)
}

onMounted(async () => {
  const routeQuery = typeof route.query.q === 'string' ? route.query.q : ''
  store.setQuery(routeQuery)
  store.setSelectedTypes(typesFromRoute())
  await store.initialize()
  catalogReady.value = true
})

onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <section
    class="flex h-[calc(100dvh-77px)] min-h-[560px] flex-col bg-background lg:h-dvh"
    aria-label="Catálogo Pokémon"
  >
    <ContentContainer
      v-if="status !== 'error'"
      as="header"
      data-testid="catalog-header-container"
      :class="[
        'relative shrink-0 px-4 pt-11 lg:px-6 lg:pt-7',
        hasActiveFilters ? 'pb-[10px]' : 'pb-4',
      ]"
    >
      <div :class="['flex items-center gap-4', { 'lg:max-w-2xl': props.expanded }]">
        <SearchField
          :model-value="query"
          label="Buscar Pokémon"
          placeholder="Buscar Pokémon..."
          name="pokemon-search"
          test-id="pokemon-search"
          :loading="refreshing"
          class="min-w-0 flex-1"
          @update:model-value="store.setQuery"
        />
        <Button
          variant="icon"
          size="icon"
          class="relative size-12 rounded-full border-[1.5px] border-[var(--border-default)] bg-card"
          aria-label="Filtrar por tipo"
          data-testid="open-filters"
          @click="filterOpen = true"
        >
          <Search class="size-5 text-[var(--text-tertiary)]" />
        </Button>
      </div>
      <div
        v-if="hasActiveFilters && status === 'ready'"
        class="mt-2 flex min-h-[18px] items-center gap-1 text-xs text-[var(--text-secondary)]"
      >
        <p class="tabular-nums">
          Se han encontrado {{ totalCount }} {{ totalCount === 1 ? 'resultado' : 'resultados' }}
        </p>
        <Button
          variant="tertiary"
          size="sm"
          class="h-auto rounded-none p-0 font-normal underline underline-offset-2"
          @click="clearFilters"
        >
          Borrar filtro
        </Button>
      </div>
      <ProgressBar
        :active="refreshing"
        label="Buscando Pokémon…"
        class="absolute inset-x-4 bottom-0 lg:inset-x-6"
      />
    </ContentContainer>

    <Transition name="state-fade" mode="out-in">
      <PokeballLoader
        v-if="initialLoading"
        key="initial-loading"
        fullscreen
        class="fixed inset-0 z-50"
      />
      <ErrorState
        v-else-if="status === 'error'"
        key="error"
        class="flex-1"
        title="Algo salió mal…"
        description="No pudimos cargar la información en este momento. Verifica tu conexión o intenta nuevamente más tarde."
        @retry="retry"
      />
      <div
        v-else-if="entries.length === 0"
        key="empty"
        class="flex flex-1 flex-col items-center justify-center px-8 text-center"
      >
        <div
          class="motion-state-art flex size-20 items-center justify-center rounded-full bg-[var(--surface-info)]"
        >
          <Search class="size-9 text-primary" />
        </div>
        <h2 class="mt-5 text-balance text-lg font-semibold">No encontramos Pokémon</h2>
        <p class="mt-2 text-pretty text-sm leading-6 text-muted-foreground">
          Prueba con otro nombre, número o combinación de tipos.
        </p>
        <Button class="mt-5" variant="secondary" @click="clearFilters">Borrar filtros</Button>
      </div>
      <ContentContainer
        v-else
        key="results"
        class="min-h-0 flex-1 px-4 lg:px-6"
        data-testid="catalog-grid-container"
      >
        <PokemonVirtualList
          :entries="entries"
          :summaries="summaries"
          :has-more="hasNextPage"
          :loading-more="nextPageStatus === 'loading'"
          :load-more-error="nextPageStatus === 'error'"
          :refreshing="refreshing"
          :result-version="resultVersion"
          @load-more="store.loadNextPage"
        />
      </ContentContainer>
    </Transition>

    <FilterSheet
      v-model:open="filterOpen"
      :selected="selectedTypes"
      :loading="filterStatus === 'loading'"
      @apply="applyTypes"
    />
  </section>
</template>
