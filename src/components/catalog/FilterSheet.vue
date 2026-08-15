<script setup lang="ts">
import { ChevronUp, X } from '@lucide/vue'
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
      <header class="relative shrink-0 px-6 pt-9">
        <Button
          variant="icon"
          size="icon-sm"
          class="absolute left-4 top-3.5"
          aria-label="Cerrar filtros"
          @click="emit('update:open', false)"
        >
          <X class="size-6" />
        </Button>
        <h2 class="text-center text-[20px] font-semibold leading-7">Filtra por tus preferencias</h2>

        <div class="mt-[68px] flex h-12 items-center justify-between">
          <h3 class="text-base font-medium">Tipo</h3>
          <ChevronUp class="size-5" aria-hidden="true" />
        </div>
      </header>

      <div
        class="scrollbar-none h-72 shrink-0 overflow-y-auto border-y border-[var(--border-default)]"
        role="group"
        aria-label="Tipos de Pokémon"
      >
        <Label
          v-for="type in filterTypes"
          :key="type"
          :for="`filter-${type}`"
          class="flex h-12 cursor-pointer items-center justify-between px-6 text-sm font-normal"
        >
          <span>{{ TYPE_META[type].label }}</span>
          <Checkbox
            :id="`filter-${type}`"
            :model-value="draft.includes(type)"
            @update:model-value="updateType(type, $event)"
          />
        </Label>
      </div>

      <footer class="shrink-0 space-y-4 px-6 py-4">
        <Button class="w-full rounded-full" :loading="loading" @click="apply">Aplicar</Button>
        <Button variant="secondary" class="w-full rounded-full" @click="emit('update:open', false)">
          Cancelar
        </Button>
      </footer>
    </div>
  </Sheet>
</template>
