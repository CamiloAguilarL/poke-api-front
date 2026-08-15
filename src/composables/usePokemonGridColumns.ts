import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export const POKEMON_GRID_GAP = 12
export const POKEMON_CARD_MIN_WIDTH = 280
export const POKEMON_GRID_MAX_COLUMNS = 5

export function getPokemonGridColumnCount(width: number) {
  if (width <= 0) return 1

  const columnFootprint = POKEMON_CARD_MIN_WIDTH + POKEMON_GRID_GAP
  return Math.min(
    POKEMON_GRID_MAX_COLUMNS,
    Math.max(1, Math.floor((width + POKEMON_GRID_GAP) / columnFootprint)),
  )
}

export function usePokemonGridColumns(element: Ref<HTMLElement | null>) {
  const width = ref(0)
  const columns = computed(() => getPokemonGridColumnCount(width.value))
  let observer: ResizeObserver | undefined

  onMounted(() => {
    if (!element.value) return

    width.value = element.value.clientWidth
    observer = new ResizeObserver(([entry]) => {
      if (entry) width.value = entry.contentRect.width
    })
    observer.observe(element.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return columns
}
