<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'
import { LoaderCircle, RefreshCw } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import type { CatalogEntry, PokemonSummary } from '@/features/pokemon/domain/models'
import PokemonCard from './PokemonCard.vue'
import PokemonCardSkeleton from './PokemonCardSkeleton.vue'

const props = withDefaults(
  defineProps<{
    entries: CatalogEntry[]
    summaries: Record<string, PokemonSummary>
    routePrefix?: '/pokedex' | '/favorites'
    hasMore?: boolean
    loadingMore?: boolean
    loadMoreError?: boolean
    resultVersion?: number
  }>(),
  {
    routePrefix: '/pokedex',
    hasMore: false,
    loadingMore: false,
    loadMoreError: false,
    resultVersion: 0,
  },
)
const emit = defineEmits<{ loadMore: [] }>()
const scrollElement = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const columns = computed(() => {
  if (!containerWidth.value) return 1
  return Math.min(5, Math.max(1, Math.floor((containerWidth.value + 12) / 292)))
})
let resizeObserver: ResizeObserver | undefined

const options = computed(() => ({
  count: Math.ceil(props.entries.length / columns.value),
  getScrollElement: () => scrollElement.value,
  estimateSize: () => 114,
  overscan: 5,
  getItemKey: (index: number) => props.entries[index * columns.value]?.id ?? index,
}))
const virtualizer = useVirtualizer(options)
const rows = computed(() => virtualizer.value.getVirtualItems())
const totalSize = computed(() => virtualizer.value.getTotalSize())

function maybeLoadMore() {
  const element = scrollElement.value
  if (!element || !props.hasMore || props.loadingMore || props.loadMoreError) return
  if (element.scrollHeight - element.scrollTop - element.clientHeight <= 320) emit('loadMore')
}

watch(
  () => props.entries.length,
  () => void nextTick(maybeLoadMore),
)

watch(
  () => props.resultVersion,
  () => {
    if (scrollElement.value) scrollElement.value.scrollTop = 0
  },
)

onMounted(() => {
  if (!scrollElement.value) return
  containerWidth.value = scrollElement.value.clientWidth
  resizeObserver = new ResizeObserver(([entry]) => {
    if (entry) {
      containerWidth.value = entry.contentRect.width
      void nextTick(maybeLoadMore)
    }
  })
  resizeObserver.observe(scrollElement.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div
    ref="scrollElement"
    class="scrollbar-none h-full overflow-y-auto"
    data-testid="pokemon-list"
    @scroll.passive="maybeLoadMore"
  >
    <div class="relative w-full" :style="{ height: `${totalSize}px` }">
      <div
        v-for="row in rows"
        :key="String(row.key)"
        class="absolute left-0 top-0 grid w-full gap-3 pb-3"
        :style="{
          height: `${row.size}px`,
          transform: `translateY(${row.start}px)`,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }"
      >
        <template v-for="column in columns" :key="column">
          <PokemonCard
            v-if="
              entries[row.index * columns + column - 1] &&
              summaries[entries[row.index * columns + column - 1]!.name]
            "
            :pokemon="summaries[entries[row.index * columns + column - 1]!.name]!"
            :route-prefix="routePrefix"
          />
          <PokemonCardSkeleton v-else-if="entries[row.index * columns + column - 1]" />
        </template>
      </div>
    </div>
    <div
      v-if="loadingMore"
      class="flex h-16 items-center justify-center gap-2 text-xs font-medium text-muted-foreground"
      role="status"
    >
      <LoaderCircle class="size-4 animate-spin" />
      Cargando más Pokémon…
    </div>
    <div
      v-else-if="loadMoreError"
      class="flex min-h-20 flex-col items-center justify-center gap-2 pb-4 text-center"
      role="alert"
    >
      <p class="text-xs text-muted-foreground">No pudimos cargar más Pokémon.</p>
      <Button variant="secondary" size="sm" @click="emit('loadMore')">
        <RefreshCw class="size-4" />
        Reintentar
      </Button>
    </div>
  </div>
</template>
