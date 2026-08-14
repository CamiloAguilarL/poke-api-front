<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{ href?: string; label?: string; class?: string }>(), {
  href: '#main-content',
  label: 'Saltar al contenido',
})
</script>

<template>
  <a
    :href="href"
    :class="
      cn(
        'fixed left-4 top-4 z-[100] -translate-y-20 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform focus-visible:translate-y-0',
        props.class,
      )
    "
    data-slot="skip-link"
  >
    {{ label }}
  </a>
</template>
