<script setup lang="ts">
import { Heart, ImageOff } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatPokemonNumber } from '@/features/pokemon/domain/formatters'
import type { PokemonSummary } from '@/features/pokemon/domain/models'
import { useFavoritesStore } from '@/stores/favorites'
import { Button } from '@/components/ui/button'
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
  <article
    class="group relative flex h-[102px] overflow-hidden rounded-2xl border border-border bg-white shadow-[0_2px_8px_rgb(18_18_18_/_4%)] transition hover:-translate-y-0.5 hover:border-[#c8d7e8] hover:shadow-[0_8px_24px_rgb(13_71_161_/_10%)]"
  >
    <RouterLink
      :to="`${routePrefix}/${pokemon.name}`"
      class="flex min-w-0 flex-1 items-center gap-3 p-3 pr-1"
      :aria-label="`Ver a ${pokemon.displayName}`"
    >
      <div
        class="relative flex size-[78px] shrink-0 items-center justify-center rounded-2xl bg-[#f2f6f8]"
      >
        <div
          class="absolute inset-2 rounded-full border-[10px] border-white/70"
          aria-hidden="true"
        />
        <img
          v-if="pokemon.sprite"
          :src="pokemon.sprite"
          :alt="pokemon.displayName"
          class="relative size-[72px] object-contain [image-rendering:auto] transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <ImageOff v-else class="relative size-7 text-[#9e9e9e]" aria-label="Imagen no disponible" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[10px] font-medium text-[#757575]">{{ formatPokemonNumber(pokemon.id) }}</p>
        <h2 class="truncate text-base font-semibold leading-6">{{ pokemon.displayName }}</h2>
        <div class="mt-1 flex flex-wrap gap-1.5">
          <TypeBadge v-for="type in pokemon.types" :key="type" :type="type" compact />
        </div>
      </div>
    </RouterLink>
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
        :class="favorite ? 'fill-[var(--favorite)] text-[var(--favorite)]' : 'text-[#616161]'"
      />
    </Button>
  </article>
</template>
