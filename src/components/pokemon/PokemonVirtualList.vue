<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref, watch } from 'vue'
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

const options = computed(() => ({
  count: props.entries.length,
  getScrollElement: () => scrollElement.value,
  estimateSize: () => 114,
  overscan: 5,
  getItemKey: (index: number) => props.entries[index]?.id ?? index,
}))
const virtualizer = useVirtualizer(options)
const rows = computed(() => virtualizer.value.getVirtualItems())
const totalSize = computed(() => virtualizer.value.getTotalSize())

watch(
  rows,
  (visibleRows) => {
    emit(
      'visible',
      visibleRows
        .map((row) => props.entries[row.index]?.name)
        .filter((name): name is string => Boolean(name)),
    )
  },
  { immediate: true },
)
</script>

<template>
  <div ref="scrollElement" class="scrollbar-none h-full overflow-y-auto" data-testid="pokemon-list">
    <div class="relative w-full" :style="{ height: `${totalSize}px` }">
      <div
        v-for="row in rows"
        :key="row.key"
        class="absolute left-0 top-0 w-full pb-3"
        :style="{ height: `${row.size}px`, transform: `translateY(${row.start}px)` }"
      >
        <PokemonCard
          v-if="entries[row.index] && summaries[entries[row.index]!.name]"
          :pokemon="summaries[entries[row.index]!.name]!"
          :route-prefix="routePrefix"
        />
        <PokemonCardSkeleton v-else />
      </div>
    </div>
  </div>
</template>
