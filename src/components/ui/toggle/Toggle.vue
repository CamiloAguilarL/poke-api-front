<script setup lang="ts">
import { Toggle } from 'reka-ui'
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { toggleVariants, type ToggleVariantProps } from './variants'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    variant?: ToggleVariantProps['variant']
    size?: ToggleVariantProps['size']
    disabled?: boolean
    class?: string
  }>(),
  { modelValue: false, variant: 'outline', size: 'default', disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const classes = computed(() =>
  cn(toggleVariants({ variant: props.variant, size: props.size }), props.class),
)
</script>

<template>
  <Toggle
    :model-value="modelValue"
    :disabled="disabled"
    :class="classes"
    data-slot="toggle"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />
  </Toggle>
</template>
