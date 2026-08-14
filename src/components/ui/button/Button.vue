<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { buttonVariants, type ButtonVariantProps } from './variants'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariantProps['variant']
    size?: ButtonVariantProps['size']
    loading?: boolean
    disabled?: boolean
    class?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'default', loading: false, disabled: false, type: 'button' },
)

const classes = computed(() => {
  return cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)
})
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading"
    data-slot="button"
  >
    <LoaderCircle v-if="loading" class="size-4 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
