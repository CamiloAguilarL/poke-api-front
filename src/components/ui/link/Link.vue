<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { cn } from '@/lib/utils'
import { linkVariants, type LinkVariantProps } from './variants'

const props = withDefaults(
  defineProps<{
    to: RouteLocationRaw
    variant?: LinkVariantProps['variant']
    class?: string
    activeClass?: string
  }>(),
  { variant: 'default', activeClass: '' },
)

const classes = computed(() => cn(linkVariants({ variant: props.variant }), props.class))
</script>

<template>
  <RouterLink
    :to="to"
    :active-class="activeClass"
    :class="classes"
    draggable="false"
    data-slot="link"
  >
    <slot />
  </RouterLink>
</template>
