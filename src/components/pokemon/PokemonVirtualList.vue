<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CatalogEntry, PokemonSummary } from '@/features/pokemon/domain/models'
import PokemonCard from './PokemonCard.vue'
import PokemonCardSkeleton from './PokemonCardSkeleton.vue'

const props = withDefaults(
  defineProps<{
    entries: CatalogEntry[]
    summaries: Record<string, PokemonSummary>
    routePrefix?: '/pokedex' | '/favorites'
  }>(),
  { routePrefix: '/pokedex' },
)
const emit = defineEmits<{ visible: [names: string[]] }>()
const scrollElement = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const columns = computed(() => (containerWidth.value >= 640 && containerWidth.value < 1024 ? 2 : 1))
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

watch(
  rows,
  (visibleRows) => {
    emit(
      'visible',
      visibleRows.flatMap((row) =>
        Array.from(
          { length: columns.value },
          (_, column) => props.entries[row.index * columns.value + column]?.name,
        ).filter((name): name is string => Boolean(name)),
      ),
    )
  },
  { immediate: true },
)

onMounted(() => {
  if (!scrollElement.value) return
  containerWidth.value = scrollElement.value.clientWidth
  resizeObserver = new ResizeObserver(([entry]) => {
    if (entry) containerWidth.value = entry.contentRect.width
  })
  resizeObserver.observe(scrollElement.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div ref="scrollElement" class="scrollbar-none h-full overflow-y-auto" data-testid="pokemon-list">
    <div class="relative w-full" :style="{ height: `${totalSize}px` }">
      <div
        v-for="row in rows"
        :key="String(row.key)"
        class="absolute left-0 top-0 grid w-full gap-3 pb-3"
        :class="columns === 2 ? 'grid-cols-2' : 'grid-cols-1'"
        :style="{ height: `${row.size}px`, transform: `translateY(${row.start}px)` }"
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
  </div>
</template>
