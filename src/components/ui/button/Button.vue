<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'icon' | 'danger'
type Size = 'default' | 'sm' | 'icon'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    class?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'default', loading: false, disabled: false, type: 'button' },
)

const classes = computed(() => {
  const variants: Record<Variant, string> = {
    primary:
      'bg-primary text-primary-foreground shadow-sm hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-pressed)]',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-[var(--action-secondary-hover)] active:bg-[var(--action-secondary-pressed)]',
    tertiary:
      'bg-transparent text-[var(--navigation-active)] hover:bg-primary/8 active:bg-primary/14',
    icon: 'bg-transparent text-foreground hover:bg-black/5 active:bg-black/10',
    danger: 'bg-destructive text-white hover:bg-red-700 active:bg-red-800',
  }
  const sizes: Record<Size, string> = {
    default: 'h-12 px-6 text-sm',
    sm: 'h-9 px-4 text-xs',
    icon: 'size-11 p-0',
  }

  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-45',
    variants[props.variant],
    sizes[props.size],
    props.class,
  )
})
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading" :aria-busy="loading">
    <LoaderCircle v-if="loading" class="size-4 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
