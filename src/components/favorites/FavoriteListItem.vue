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
}
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-destructive">
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
      class="relative touch-pan-y bg-background transition-transform"
      :style="{ transform: `translateX(${offset}px)` }"
      @pointerdown="pointerDown"
      @pointermove="pointerMove"
      @pointerup="pointerUp"
      @pointercancel="pointerUp"
    >
      <PokemonCard :pokemon="pokemon" route-prefix="/favorites" />
    </div>
  </div>
</template>
