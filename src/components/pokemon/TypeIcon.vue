<script setup lang="ts">
import { computed } from 'vue'
import type { PokemonTypeName } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'
import { cn } from '@/lib/utils'

const props = defineProps<{ type: PokemonTypeName; class?: string }>()
const maskStyle = computed(() => {
  const image = `url("${TYPE_META[props.type].icon}")`
  return { maskImage: image, WebkitMaskImage: image }
})
</script>

<template>
  <span
    :class="
      cn(
        'inline-block shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]',
        props.class,
      )
    "
    :style="maskStyle"
    aria-hidden="true"
    data-testid="type-icon"
  />
</template>
