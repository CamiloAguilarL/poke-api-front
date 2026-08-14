<script setup lang="ts">
import { ArrowLeft, Heart, Mars, Share2, Venus } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/components/ui/sonner'
import ErrorState from '@/components/states/ErrorState.vue'
import PokeballLoader from '@/components/PokeballLoader.vue'
import TypeBadge from '@/components/pokemon/TypeBadge.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { pokemonRepository } from '@/features/pokemon/api/pokemon-repository'
import {
  formatHeight,
  formatPercentage,
  formatPokemonNumber,
  formatSharePayload,
  formatWeight,
} from '@/features/pokemon/domain/formatters'
import type { PokemonDetail } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'
import { useFavoritesStore } from '@/stores/favorites'

const props = defineProps<{ name: string }>()
const router = useRouter()
const favorites = useFavoritesStore()
const pokemon = ref<PokemonDetail | null>(null)
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
const favorite = computed(() => (pokemon.value ? favorites.has(pokemon.value.name) : false))
const heroColor = computed(() => {
  const type = pokemon.value?.types[0]
  return type ? TYPE_META[type].color : 'var(--action-primary)'
})

async function load() {
  status.value = 'loading'
  errorMessage.value = ''
  try {
    pokemon.value = await pokemonRepository.getDetail(props.name)
    status.value = 'ready'
  } catch (error) {
    status.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : 'No pudimos cargar este Pokémon.'
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else void router.push('/pokedex')
}

function toggleFavorite() {
  if (!pokemon.value) return
  const added = favorites.toggle(pokemon.value.name)
  toast.success(added ? 'Agregado a favoritos' : 'Quitado de favoritos')
}

function legacyCopy(value: string) {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

async function share() {
  if (!pokemon.value) return
  const payload = formatSharePayload(pokemon.value)
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(payload)
    else legacyCopy(payload)
    toast.success('Información copiada al portapapeles')
  } catch {
    toast.error('No pudimos copiar la información')
  }
}

watch(() => props.name, load, { immediate: true })
</script>

<template>
  <PokeballLoader v-if="status === 'loading'" fullscreen label="Consultando la ficha Pokémon" />
  <ErrorState
    v-else-if="status === 'error'"
    class="min-h-dvh"
    title="No pudimos abrir esta ficha"
    :description="errorMessage"
    @retry="load"
  />
  <article v-else-if="pokemon" class="min-h-dvh bg-background" data-testid="pokemon-detail">
    <header
      class="pokemon-hero relative h-[354px] overflow-hidden px-4 pt-11 text-[var(--hero-foreground)] sm:h-[390px] lg:h-[420px] lg:px-8 lg:pt-7"
      :style="{ '--hero-color': heroColor }"
    >
      <div class="relative z-10 mx-auto flex max-w-4xl items-center justify-between">
        <Button
          variant="icon"
          size="icon"
          class="bg-[var(--hero-control)] text-[var(--hero-foreground)] hover:bg-[var(--hero-control-hover)]"
          aria-label="Volver"
          @click="goBack"
        >
          <ArrowLeft class="size-6" />
        </Button>
        <div class="flex gap-1">
          <Button
            variant="icon"
            size="icon"
            class="bg-[var(--hero-control)] text-[var(--hero-foreground)] hover:bg-[var(--hero-control-hover)]"
            aria-label="Copiar información del Pokémon"
            data-testid="share-pokemon"
            @click="share"
          >
            <Share2 class="size-5" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            class="bg-[var(--hero-control)] text-[var(--hero-foreground)] hover:bg-[var(--hero-control-hover)]"
            :aria-label="favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
            :aria-pressed="favorite"
            data-testid="favorite-detail"
            @click="toggleFavorite"
          >
            <Heart :class="['size-6', { 'fill-[var(--hero-foreground)]': favorite }]" />
          </Button>
        </div>
      </div>
      <div class="relative z-10 mx-auto mt-1 flex max-w-4xl items-start justify-between gap-4">
        <div class="pt-4">
          <p class="tabular-nums text-xs font-medium text-[var(--hero-foreground-muted)]">
            {{ formatPokemonNumber(pokemon.id) }}
          </p>
          <h1 class="mt-0.5 text-[28px] font-semibold leading-tight sm:text-4xl">
            {{ pokemon.displayName }}
          </h1>
        </div>
        <div class="mt-4 flex flex-wrap justify-end gap-1.5">
          <TypeBadge v-for="type in pokemon.types" :key="type" :type="type" compact />
        </div>
      </div>
      <img
        v-if="pokemon.artwork || pokemon.sprite"
        :src="pokemon.artwork ?? pokemon.sprite ?? undefined"
        :alt="pokemon.displayName"
        width="360"
        height="315"
        fetchpriority="high"
        class="pokemon-artwork absolute bottom-[-8px] left-1/2 z-10 h-[244px] w-[280px] -translate-x-1/2 object-contain sm:h-[280px] lg:h-[315px] lg:w-[360px]"
      />
    </header>

    <div
      class="relative z-20 -mt-5 rounded-t-[24px] bg-background px-4 pb-12 pt-7 lg:px-8 lg:pb-16"
    >
      <div class="mx-auto max-w-4xl">
        <section aria-labelledby="about-heading">
          <h2 id="about-heading" class="text-lg font-semibold">Descripción</h2>
          <p class="mt-3 text-pretty text-sm leading-6 text-muted-foreground">
            {{ pokemon.description }}
          </p>
        </section>

        <section class="mt-7" aria-labelledby="features-heading">
          <h2 id="features-heading" class="text-lg font-semibold">Características</h2>
          <dl class="mt-4 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4">
            <div>
              <dt class="text-xs text-muted-foreground">Peso</dt>
              <dd class="mt-1 tabular-nums text-sm font-semibold">
                {{ formatWeight(pokemon.weightHectograms) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Altura</dt>
              <dd class="mt-1 tabular-nums text-sm font-semibold">
                {{ formatHeight(pokemon.heightDecimeters) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Categoría</dt>
              <dd class="mt-1 text-sm font-semibold">{{ pokemon.category }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Habilidad</dt>
              <dd class="mt-1 text-sm font-semibold">{{ pokemon.abilities.join(', ') }}</dd>
            </div>
          </dl>
        </section>

        <section class="mt-7" aria-labelledby="gender-heading">
          <h2 id="gender-heading" class="text-lg font-semibold">Género</h2>
          <p v-if="pokemon.gender.genderless" class="mt-3 text-sm text-muted-foreground">
            Este Pokémon no tiene género.
          </p>
          <div v-else class="mt-4 grid grid-cols-2 gap-4">
            <Card class="border-transparent bg-[var(--surface-masculine)] p-4 shadow-none">
              <Mars class="size-5 text-[var(--gender-male)]" />
              <p class="mt-2 text-xs text-muted-foreground">Masculino</p>
              <p class="tabular-nums text-base font-semibold">
                {{ formatPercentage(pokemon.gender.male) }}
              </p>
            </Card>
            <Card class="border-transparent bg-[var(--surface-feminine)] p-4 shadow-none">
              <Venus class="size-5 text-[var(--gender-female)]" />
              <p class="mt-2 text-xs text-muted-foreground">Femenino</p>
              <p class="tabular-nums text-base font-semibold">
                {{ formatPercentage(pokemon.gender.female) }}
              </p>
            </Card>
          </div>
        </section>

        <section class="mt-7" aria-labelledby="weakness-heading">
          <h2 id="weakness-heading" class="text-lg font-semibold">Debilidades</h2>
          <div class="mt-4 flex flex-wrap gap-2">
            <div v-for="weakness in pokemon.weaknesses" :key="weakness.type" class="relative">
              <TypeBadge :type="weakness.type" />
              <span
                v-if="weakness.multiplier > 2"
                class="absolute -right-1 -top-1 rounded-full bg-card px-1 text-[9px] font-bold tabular-nums text-foreground shadow"
              >
                ×{{ weakness.multiplier }}
              </span>
            </div>
          </div>
        </section>

        <section v-if="pokemon.evolutions.length" class="mt-8" aria-labelledby="evolutions-heading">
          <h2 id="evolutions-heading" class="text-lg font-semibold">Evoluciones</h2>
          <div
            class="scrollbar-none -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0"
          >
            <Link
              v-for="evolution in pokemon.evolutions"
              :key="evolution.name"
              :to="`/pokedex/${evolution.name}`"
              variant="compactCard"
            >
              <img
                v-if="evolution.sprite"
                :src="evolution.sprite"
                :alt="evolution.displayName"
                width="78"
                height="78"
                class="size-[78px] object-contain"
                loading="lazy"
              />
              <div v-else class="size-[78px]" />
              <span class="mt-1 text-[10px] tabular-nums text-muted-foreground">{{
                formatPokemonNumber(evolution.id)
              }}</span>
              <span class="truncate text-xs font-semibold">{{ evolution.displayName }}</span>
            </Link>
          </div>
        </section>

        <Button class="mt-8 w-full sm:w-auto" @click="share">
          <Share2 class="size-4" />
          Copiar información
        </Button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.pokemon-hero {
  background:
    radial-gradient(circle at 82% 26%, var(--hero-spot-strong) 0 58px, transparent 59px),
    radial-gradient(circle at 18% 84%, var(--hero-spot-soft) 0 82px, transparent 83px),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--hero-color) 84%, var(--surface-card)),
      var(--hero-color)
    );
}

.pokemon-artwork {
  filter: drop-shadow(var(--shadow-sprite));
}

.pokemon-hero::after {
  position: absolute;
  right: -68px;
  bottom: -72px;
  width: 280px;
  height: 280px;
  border: 34px solid var(--hero-ring);
  border-radius: 50%;
  content: '';
}
</style>
