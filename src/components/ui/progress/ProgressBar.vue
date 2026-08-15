<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{ active?: boolean; label?: string; class?: string }>(), {
  active: false,
  label: 'Cargando…',
})
</script>

<template>
  <Transition name="progress-fade">
    <div
      v-if="active"
      :class="cn('h-0.5 w-full overflow-hidden bg-primary/10', props.class)"
      role="status"
      aria-live="polite"
      data-slot="progress"
    >
      <span class="sr-only">{{ label }}</span>
      <span
        class="async-progress-indicator block h-full w-1/2 rounded-full bg-primary"
        aria-hidden="true"
      />
    </div>
  </Transition>
</template>
