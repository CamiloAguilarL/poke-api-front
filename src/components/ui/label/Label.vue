<script setup lang="ts">
import { Label } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<{ for: string; class?: string }>()
</script>

<template>
  <Label
    :for="props.for"
    :class="cn('text-sm font-medium leading-none', props.class)"
    data-slot="label"
  >
    <slot />
  </Label>
</template>
