<script setup lang="ts">
import { Heart, ImageOff } from '@lucide/vue'
import { computed } from 'vue'
import { formatPokemonNumber } from '@/features/pokemon/domain/formatters'
import type { PokemonSummary } from '@/features/pokemon/domain/models'
import { useFavoritesStore } from '@/stores/favorites'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import TypeBadge from './TypeBadge.vue'

const props = withDefaults(
  defineProps<{ pokemon: PokemonSummary; routePrefix?: '/pokedex' | '/favorites' }>(),
  { routePrefix: '/pokedex' },
)
const favorites = useFavoritesStore()
const favorite = computed(() => favorites.has(props.pokemon.name))

function toggleFavorite() {
  favorites.toggle(props.pokemon.name)
}
</script>

<template>
  <Card
    as="article"
    class="group relative flex h-[102px] overflow-hidden shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--border-card-hover)] hover:shadow-[var(--shadow-card-hover)]"
  >
    <Link
      :to="`${routePrefix}/${pokemon.name}`"
      variant="card"
      :aria-label="`Ver a ${pokemon.displayName}`"
    >
      <div
        class="relative flex size-[78px] shrink-0 items-center justify-center rounded-2xl bg-muted"
      >
        <div
          class="absolute inset-2 rounded-full border-[10px] border-[var(--card-art-ring)]"
          aria-hidden="true"
        />
        <img
          v-if="pokemon.sprite"
          :src="pokemon.sprite"
          :alt="pokemon.displayName"
          width="72"
          height="72"
          draggable="false"
          class="relative size-[72px] object-contain [image-rendering:auto] transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <ImageOff
          v-else
          class="relative size-7 text-[var(--text-disabled)]"
          aria-label="Imagen no disponible"
        />
      </div>
      <div class="min-w-0 flex-1">
        <p class="tabular-nums text-[10px] font-medium text-[var(--text-tertiary)]">
          {{ formatPokemonNumber(pokemon.id) }}
        </p>
        <h2 class="truncate text-base font-semibold leading-6">{{ pokemon.displayName }}</h2>
        <div class="mt-1 flex flex-wrap gap-1.5">
          <TypeBadge v-for="type in pokemon.types" :key="type" :type="type" compact />
        </div>
      </div>
    </Link>
    <Button
      variant="icon"
      size="icon"
      class="mr-1.5 mt-1.5"
      :aria-label="
        favorite
          ? `Quitar a ${pokemon.displayName} de favoritos`
          : `Agregar a ${pokemon.displayName} a favoritos`
      "
      :aria-pressed="favorite"
      @click="toggleFavorite"
    >
      <Heart
        class="size-5"
        :class="
          favorite ? 'fill-[var(--favorite)] text-[var(--favorite)]' : 'text-[var(--text-icon)]'
        "
      />
    </Button>
  </Card>
</template>
