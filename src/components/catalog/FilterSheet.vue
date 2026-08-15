<script setup lang="ts">
import { X } from '@lucide/vue'
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Sheet } from '@/components/ui/sheet'
import { POKEMON_TYPES, type PokemonTypeName } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'

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

const preferredOrder: PokemonTypeName[] = ['water', 'dragon', 'electric', 'fairy', 'ghost', 'fire']
const filterTypes = [
  ...preferredOrder,
  ...POKEMON_TYPES.filter((type) => !preferredOrder.includes(type)),
]

watch(
  () => props.open,
  (open) => {
    if (open) draft.value = [...props.selected]
  },
  { immediate: true },
)

function updateType(type: PokemonTypeName, selected: boolean) {
  draft.value = selected
    ? [...new Set([...draft.value, type])]
    : draft.value.filter((value) => value !== type)
}

function apply() {
  emit('apply', [...draft.value])
}
</script>

<template>
  <Sheet
    :open="open"
    title="Filtra por tus preferencias"
    description="Selecciona uno o más tipos de Pokémon"
    @update:open="emit('update:open', $event)"
  >
    <div class="flex h-full flex-col">
      <header class="relative shrink-0 px-4 pt-[52px] md:px-8 md:pt-7">
        <Button
          variant="icon"
          size="icon-sm"
          class="absolute left-4 top-3.5 md:left-6 md:top-6"
          aria-label="Cerrar filtros"
          @click="emit('update:open', false)"
        >
          <X class="size-6" />
        </Button>
        <h2 class="text-center text-[20px] font-semibold leading-7">Filtra por tus preferencias</h2>
        <p class="mt-1 hidden text-center text-sm text-[var(--text-secondary)] md:block">
          Selecciona uno o más tipos de Pokémon
        </p>

        <div
          class="mt-12 flex h-12 items-center md:mt-7 md:h-auto md:pb-4"
          data-testid="filter-type-header"
        >
          <h3 class="text-base font-medium">Tipo</h3>
        </div>
      </header>

      <div
        class="scrollbar-none min-h-0 flex-1 overflow-y-auto border-y border-[var(--border-default)] md:grid md:auto-rows-[48px] md:grid-cols-2 md:content-start"
        role="group"
        aria-label="Tipos de Pokémon"
      >
        <Label
          v-for="type in filterTypes"
          :key="type"
          :for="`filter-${type}`"
          class="flex h-[42px] cursor-pointer items-center justify-between pl-4 pr-6 text-sm font-normal md:h-12 md:border-b md:border-[var(--border-default)] md:px-6 md:odd:border-r"
        >
          <span>{{ TYPE_META[type].label }}</span>
          <Checkbox
            :id="`filter-${type}`"
            :model-value="draft.includes(type)"
            @update:model-value="updateType(type, $event)"
          />
        </Label>
      </div>

      <footer
        class="shrink-0 space-y-4 bg-background px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[25px] md:flex md:flex-row-reverse md:gap-3 md:space-y-0 md:px-8 md:py-6"
      >
        <Button class="w-full rounded-full md:flex-1" :loading="loading" @click="apply">
          Aplicar
        </Button>
        <Button
          variant="secondary"
          class="w-full rounded-full md:flex-1"
          @click="emit('update:open', false)"
        >
          Cancelar
        </Button>
      </footer>
    </div>
  </Sheet>
</template>
