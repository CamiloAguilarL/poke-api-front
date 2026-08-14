<script setup lang="ts">
import type { PokemonTypeName } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'

const props = withDefaults(defineProps<{ type: PokemonTypeName; compact?: boolean }>(), {
  compact: false,
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-semibold text-white shadow-sm',
      compact ? 'gap-1 px-2 py-1 text-[10px]' : 'gap-2 px-3 py-1.5 text-xs',
      { '!text-black': TYPE_META[props.type].darkText },
    ]"
    :style="{ backgroundColor: TYPE_META[props.type].color }"
  >
    <img
      :src="TYPE_META[props.type].icon"
      :alt="`${TYPE_META[props.type].label}:`"
      :class="compact ? 'size-3' : 'size-4'"
    />
    {{ TYPE_META[props.type].label }}
  </span>
</template>
