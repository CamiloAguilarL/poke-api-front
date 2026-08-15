<script setup lang="ts">
import type { PokemonTypeName } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'
import { Badge } from '@/components/ui/badge'
import TypeIcon from './TypeIcon.vue'

const props = withDefaults(defineProps<{ type: PokemonTypeName; compact?: boolean }>(), {
  compact: false,
})
</script>

<template>
  <Badge
    variant="type"
    :size="compact ? 'compact' : 'default'"
    :style="{ backgroundColor: TYPE_META[props.type].color }"
  >
    <span
      class="flex size-[18px] items-center justify-center rounded-full bg-white"
      :style="{ color: TYPE_META[props.type].color }"
    >
      <TypeIcon :type="type" class="size-[11px]" />
    </span>
    {{ TYPE_META[props.type].label }}
  </Badge>
</template>
