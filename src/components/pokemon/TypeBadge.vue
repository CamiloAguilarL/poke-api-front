<script setup lang="ts">
import { computed } from 'vue'
import type { PokemonTypeName } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'
import { Badge } from '@/components/ui/badge'
import TypeIcon from './TypeIcon.vue'

const props = withDefaults(defineProps<{ type: PokemonTypeName; compact?: boolean }>(), {
  compact: false,
})
const meta = computed(() => TYPE_META[props.type])
const contentColor = computed(() => `var(--text-${meta.value.contentTone})`)
</script>

<template>
  <Badge
    variant="type"
    :size="compact ? 'compact' : 'default'"
    :style="{ backgroundColor: meta.color, color: contentColor }"
  >
    <span
      class="flex size-[18px] items-center justify-center rounded-full bg-[var(--surface-default)]"
      :style="{ color: meta.color }"
    >
      <TypeIcon :type="type" class="size-[11px]" />
    </span>
    {{ meta.label }}
  </Badge>
</template>
