<script setup lang="ts">
import { Heart, ImageOff } from '@lucide/vue'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { formatPokemonNumber } from '@/features/pokemon/domain/formatters'
import type { PokemonSummary } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'
import { useFavoritesStore } from '@/stores/favorites'
import TypeBadge from './TypeBadge.vue'
import TypeIcon from './TypeIcon.vue'

const props = withDefaults(
  defineProps<{ pokemon: PokemonSummary; routePrefix?: '/pokedex' | '/favorites' }>(),
  { routePrefix: '/pokedex' },
)
const favorites = useFavoritesStore()
const favorite = computed(() => favorites.has(props.pokemon.name))
const primaryType = computed(() => props.pokemon.types[0] ?? 'normal')
const typeColor = computed(() => TYPE_META[primaryType.value].color)
const cardSurface = computed(
  () => `color-mix(in srgb, ${typeColor.value} 46%, var(--surface-card))`,
)

function toggleFavorite() {
  favorites.toggle(props.pokemon.name)
}
</script>

<template>
  <Card
    as="article"
    class="group relative flex h-[102px] overflow-hidden border-transparent shadow-none transition-[border-color,box-shadow] duration-200 hover:border-[var(--border-card-hover)] hover:shadow-[var(--shadow-card-hover)]"
    :style="{ backgroundColor: cardSurface }"
  >
    <Link
      :to="`${routePrefix}/${pokemon.name}`"
      variant="card"
      :aria-label="`Ver a ${pokemon.displayName}`"
    >
      <div class="min-w-0 flex-1 py-3 pl-4 pr-[132px]">
        <p class="tabular-nums text-[10px] font-medium leading-[14px] text-[var(--text-secondary)]">
          {{ formatPokemonNumber(pokemon.id) }}
        </p>
        <h2 class="truncate text-[20px] font-semibold leading-[25px]">{{ pokemon.displayName }}</h2>
        <div class="mt-1 flex flex-nowrap gap-1 overflow-hidden">
          <TypeBadge v-for="type in pokemon.types" :key="type" :type="type" compact />
        </div>
      </div>

      <div
        class="absolute inset-y-0 right-0 flex w-32 items-center justify-center overflow-hidden rounded-2xl"
        :style="{ backgroundColor: typeColor }"
      >
        <TypeIcon
          :type="primaryType"
          class="absolute size-[112px] -rotate-12 text-white opacity-45"
        />
        <img
          v-if="pokemon.sprite"
          :src="pokemon.sprite"
          :alt="pokemon.displayName"
          width="92"
          height="92"
          draggable="false"
          class="relative size-[92px] object-contain [image-rendering:pixelated] transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <ImageOff
          v-else
          class="relative size-7 text-[var(--text-disabled)]"
          aria-label="Imagen no disponible"
        />
      </div>
    </Link>
    <Button
      variant="icon"
      size="icon-sm"
      class="absolute right-2 top-2 z-10 size-9 rounded-full border-2 border-white bg-black/15 text-white hover:bg-black/25"
      :aria-label="
        favorite
          ? `Quitar a ${pokemon.displayName} de favoritos`
          : `Agregar a ${pokemon.displayName} a favoritos`
      "
      :aria-pressed="favorite"
      @click="toggleFavorite"
    >
      <Transition name="heart-pop" mode="out-in">
        <Heart
          :key="favorite ? 'favorite' : 'available'"
          class="size-6"
          :class="favorite ? 'fill-[var(--favorite)] text-[var(--favorite)]' : 'text-white'"
        />
      </Transition>
    </Button>
  </Card>
</template>
