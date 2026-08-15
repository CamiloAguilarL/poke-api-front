<script setup lang="ts">
import { Check } from '@lucide/vue'
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{ id: string; modelValue?: boolean; disabled?: boolean; class?: string }>(),
  { modelValue: false, disabled: false },
)
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <CheckboxRoot
    :id="id"
    :model-value="modelValue"
    :disabled="disabled"
    :class="
      cn(
        'flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border border-[var(--border-default)] bg-card text-primary-foreground transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-[var(--navigation-active)] disabled:opacity-45',
        props.class,
      )
    "
    data-slot="checkbox"
    @update:model-value="emit('update:modelValue', Boolean($event))"
  >
    <CheckboxIndicator class="flex items-center justify-center">
      <Check class="size-3" :stroke-width="3" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
