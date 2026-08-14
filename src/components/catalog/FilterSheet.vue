<script setup lang="ts">
import { Check } from '@lucide/vue'
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
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
        <button
          v-for="type in POKEMON_TYPES"
          :key="type"
          type="button"
          :aria-pressed="draft.includes(type)"
          class="flex h-12 items-center gap-2 rounded-2xl border px-3 text-left text-xs font-medium transition"
          :class="
            draft.includes(type)
              ? 'border-primary bg-primary/8 text-primary'
              : 'border-border bg-white hover:border-[#b5c9df]'
          "
          @click="toggle(type)"
        >
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full"
            :style="{ backgroundColor: TYPE_META[type].color }"
          >
            <img :src="TYPE_META[type].icon" alt="" class="size-4" />
          </span>
          <span class="min-w-0 flex-1 truncate">{{ TYPE_META[type].label }}</span>
          <Check v-if="draft.includes(type)" class="size-4 shrink-0" aria-hidden="true" />
        </button>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" @click="emit('update:open', false)">Cancelar</Button>
        <Button :loading="loading" @click="apply">Aplicar</Button>
      </div>
    </div>
  </Sheet>
</template>
