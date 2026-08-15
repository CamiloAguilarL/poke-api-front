<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    as?: keyof HTMLElementTagNameMap
    class?: string | string[]
  }>(),
  { as: 'div' },
)
</script>

<template>
  <component
    :is="as"
    :class="cn('mx-auto w-full max-w-[var(--layout-content-max)]', props.class)"
    data-slot="content-container"
  >
    <slot />
  </component>
</template>
