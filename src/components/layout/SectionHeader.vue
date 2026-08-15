<script setup lang="ts">
import ContentContainer from '@/components/layout/ContentContainer.vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  title: string
  subtitle?: string
  class?: string | string[]
}>()
</script>

<template>
  <ContentContainer
    as="header"
    :class="cn('shrink-0 px-4 pb-4 pt-6 lg:px-6 lg:pb-5 lg:pt-8', props.class)"
    data-slot="section-header"
  >
    <h1 class="text-[24px] font-semibold leading-8 lg:text-[26px]">{{ title }}</h1>
    <p v-if="subtitle" class="mt-1 text-sm text-[var(--text-secondary)]">{{ subtitle }}</p>
    <slot />
  </ContentContainer>
</template>
