<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import PokemonCard from '@/components/pokemon/PokemonCard.vue'
import { Button } from '@/components/ui/button'
import type { PokemonSummary } from '@/features/pokemon/domain/models'

defineProps<{ pokemon: PokemonSummary }>()
const emit = defineEmits<{ remove: [] }>()
const offset = ref(0)
let startX = 0
let moved = false

function pointerDown(event: PointerEvent) {
  startX = event.clientX
  moved = false
}

function pointerMove(event: PointerEvent) {
  if (!startX) return
  if (Math.abs(event.clientX - startX) > 4) moved = true
  const target = event.currentTarget as HTMLElement
  if (moved && !target.hasPointerCapture(event.pointerId)) {
    target.setPointerCapture(event.pointerId)
  }
  offset.value = Math.max(-84, Math.min(0, event.clientX - startX))
}

function pointerUp() {
  offset.value = offset.value < -42 ? -76 : 0
  startX = 0
  window.getSelection()?.removeAllRanges()
}

function preventClickAfterSwipe(event: MouseEvent) {
  if (!moved) return
  event.preventDefault()
  event.stopPropagation()
  moved = false
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl bg-destructive shadow-none transition-[box-shadow] duration-200 hover:shadow-[var(--shadow-card-hover)]"
    data-testid="favorite-list-item"
  >
    <Button
      variant="danger"
      size="icon"
      class="absolute inset-y-0 right-0 h-full w-[76px] rounded-none"
      :aria-label="`Eliminar a ${pokemon.displayName} de favoritos`"
      @click="emit('remove')"
    >
      <Trash2 class="size-5" />
    </Button>
    <div
      class="favorite-gesture relative touch-pan-y select-none bg-background transition-transform"
      data-testid="favorite-card-gesture"
      :style="{ transform: `translateX(${offset}px)` }"
      @click.capture="preventClickAfterSwipe"
      @pointerdown="pointerDown"
      @pointermove.prevent="pointerMove"
      @pointerup="pointerUp"
      @pointercancel="pointerUp"
      @dragstart.prevent
    >
      <PokemonCard :pokemon="pokemon" route-prefix="/favorites" />
    </div>
  </div>
</template>

<style scoped>
.favorite-gesture,
.favorite-gesture * {
  -webkit-user-select: none;
  user-select: none;
}

.favorite-gesture a,
.favorite-gesture img {
  -webkit-user-drag: none;
}

.favorite-gesture *::selection {
  color: inherit;
  background: transparent;
}
</style>
