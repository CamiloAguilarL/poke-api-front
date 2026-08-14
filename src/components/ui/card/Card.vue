<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{ as?: keyof HTMLElementTagNameMap; class?: string }>(), {
  as: 'div',
})
</script>

<template>
  <component
    :is="as"
    :class="cn('rounded-2xl border border-border bg-card text-card-foreground', props.class)"
    data-slot="card"
  >
    <slot />
  </component>
</template>
