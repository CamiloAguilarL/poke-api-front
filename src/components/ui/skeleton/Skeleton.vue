<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <div
    :class="cn('animate-pulse rounded-xl bg-[var(--surface-skeleton)]', props.class)"
    aria-hidden="true"
    data-slot="skeleton"
  />
</template>
