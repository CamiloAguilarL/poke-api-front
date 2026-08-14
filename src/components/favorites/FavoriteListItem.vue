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

function pointerDown(event: PointerEvent) {
  startX = event.clientX
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function pointerMove(event: PointerEvent) {
  if (!startX) return
  offset.value = Math.max(-84, Math.min(0, event.clientX - startX))
}

function pointerUp() {
  offset.value = offset.value < -42 ? -76 : 0
  startX = 0
  window.getSelection()?.removeAllRanges()
}
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-destructive" data-testid="favorite-list-item">
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
      @pointerdown.prevent="pointerDown"
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
  user-select: none;
}

.favorite-gesture *::selection {
  color: inherit;
  background: transparent;
}
</style>
