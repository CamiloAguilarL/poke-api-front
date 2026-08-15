<script setup lang="ts">
import { LoaderCircle, Search, X } from '@lucide/vue'
import { useId } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    autocomplete?: string
    name?: string
    testId?: string
    loading?: boolean
  }>(),
  {
    label: 'Buscar',
    placeholder: 'Buscar...',
    autocomplete: 'off',
    name: 'search',
    loading: false,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const inputId = `search-${useId()}`
</script>

<template>
  <div class="relative min-w-0" :aria-busy="loading" data-slot="search-field">
    <Label :for="inputId" class="sr-only">{{ label }}</Label>
    <Transition name="search-icon" mode="out-in">
      <LoaderCircle
        v-if="loading"
        key="loading"
        class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-primary"
        aria-hidden="true"
      />
      <Search
        v-else
        key="search"
        class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--text-tertiary)]"
        aria-hidden="true"
      />
    </Transition>
    <Input
      :id="inputId"
      :model-value="modelValue"
      type="search"
      :name="name"
      :autocomplete="autocomplete"
      inputmode="search"
      enterkeyhint="search"
      :spellcheck="false"
      :placeholder="placeholder"
      class="rounded-full border-[1.5px] border-[var(--border-default)] bg-card pl-11 pr-10 focus:border-primary"
      :data-testid="testId"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <Button
      v-if="modelValue"
      type="button"
      variant="icon"
      size="icon-sm"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-icon)]"
      aria-label="Limpiar búsqueda"
      @click="emit('update:modelValue', '')"
    >
      <X class="size-4" />
    </Button>
  </div>
</template>
