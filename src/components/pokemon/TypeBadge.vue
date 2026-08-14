<script setup lang="ts">
import type { PokemonTypeName } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'
import { Badge } from '@/components/ui/badge'

const props = withDefaults(defineProps<{ type: PokemonTypeName; compact?: boolean }>(), {
  compact: false,
})
</script>

<template>
  <Badge
    variant="type"
    :size="compact ? 'compact' : 'default'"
    :class="TYPE_META[props.type].darkText ? '!text-foreground' : ''"
    :style="{ backgroundColor: TYPE_META[props.type].color }"
  >
    <img
      :src="TYPE_META[props.type].icon"
      :alt="`${TYPE_META[props.type].label}:`"
      :class="compact ? 'size-3' : 'size-4'"
    />
    {{ TYPE_META[props.type].label }}
  </Badge>
</template>
