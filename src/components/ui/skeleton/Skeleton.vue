<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <div :class="cn('animate-pulse rounded-xl bg-[#e8edf1]', props.class)" aria-hidden="true" />
</template>
