<script setup lang="ts">
import { useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ modelValue?: string; class?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const attrs = useAttrs()
</script>

<template>
  <input
    v-bind="attrs"
    :value="modelValue"
    data-slot="input"
    :class="
      cn(
        'h-12 w-full rounded-2xl border border-border bg-card text-sm text-foreground placeholder:text-[var(--text-placeholder)] transition-shadow',
        props.class,
      )
    "
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
