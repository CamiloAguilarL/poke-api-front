<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { badgeVariants, type BadgeVariantProps } from './variants'

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariantProps['variant']
    size?: BadgeVariantProps['size']
    class?: string
  }>(),
  { variant: 'default', size: 'default' },
)

const classes = computed(() =>
  cn(badgeVariants({ variant: props.variant, size: props.size }), props.class),
)
</script>

<template>
  <span :class="classes" data-slot="badge"><slot /></span>
</template>
