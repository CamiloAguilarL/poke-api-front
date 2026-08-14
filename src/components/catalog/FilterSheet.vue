<script setup lang="ts">
import { Check } from '@lucide/vue'
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Toggle } from '@/components/ui/toggle'
import { POKEMON_TYPES, type PokemonTypeName } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'
import TypeIcon from '@/components/pokemon/TypeIcon.vue'

const props = defineProps<{
  open: boolean
  selected: PokemonTypeName[]
  loading?: boolean
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  apply: [types: PokemonTypeName[]]
}>()
const draft = ref<PokemonTypeName[]>([])

watch(
  () => props.open,
  (open) => {
    if (open) draft.value = [...props.selected]
  },
  { immediate: true },
)

function toggle(type: PokemonTypeName) {
  draft.value = draft.value.includes(type)
    ? draft.value.filter((value) => value !== type)
    : [...draft.value, type]
}

function apply() {
  emit('apply', [...draft.value])
}
</script>

<template>
  <Sheet
    :open="open"
    title="Filtrar por tipo"
    description="Selecciona uno o más tipos de Pokémon"
    @update:open="emit('update:open', $event)"
  >
    <div class="px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-5 md:px-6 md:pb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold">Filtrar por tipo</h2>
          <p class="mt-1 text-xs leading-5 text-muted-foreground">
            Puedes seleccionar más de una opción.
          </p>
        </div>
        <Button variant="tertiary" size="sm" @click="draft = []">Limpiar</Button>
      </div>

      <div
        class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3"
        role="group"
        aria-label="Tipos de Pokémon"
      >
        <Toggle
          v-for="type in POKEMON_TYPES"
          :key="type"
          :model-value="draft.includes(type)"
          class="justify-start text-left"
          @update:model-value="toggle(type)"
        >
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full"
            :class="TYPE_META[type].darkText ? 'text-foreground' : 'text-primary-foreground'"
            :style="{ backgroundColor: TYPE_META[type].color }"
          >
            <TypeIcon :type="type" class="size-4" />
          </span>
          <span class="min-w-0 flex-1 truncate">{{ TYPE_META[type].label }}</span>
          <Check v-if="draft.includes(type)" class="size-4 shrink-0" aria-hidden="true" />
        </Toggle>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" @click="emit('update:open', false)">Cancelar</Button>
        <Button :loading="loading" @click="apply">Aplicar</Button>
      </div>
    </div>
  </Sheet>
</template>
