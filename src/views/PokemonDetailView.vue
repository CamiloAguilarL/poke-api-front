<script setup lang="ts">
import {
  ChevronLeft,
  CircleDot,
  Grid2X2,
  Heart,
  Mars,
  Ruler,
  Share2,
  Venus,
  Weight,
} from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'
import TypeBadge from '@/components/pokemon/TypeBadge.vue'
import TypeIcon from '@/components/pokemon/TypeIcon.vue'
import ErrorState from '@/components/states/ErrorState.vue'
import PokeballLoader from '@/components/PokeballLoader.vue'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner'
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
const primaryType = computed(() => pokemon.value?.types[0] ?? 'normal')
const heroColor = computed(() => TYPE_META[primaryType.value].color)
const weaknessPriority = ['fire', 'psychic', 'ice', 'flying']
const sortedWeaknesses = computed(() =>
  [...(pokemon.value?.weaknesses ?? [])].sort((left, right) => {
    const leftPriority = weaknessPriority.indexOf(left.type)
    const rightPriority = weaknessPriority.indexOf(right.type)
    if (leftPriority === -1 && rightPriority === -1) return 0
    if (leftPriority === -1) return 1
    if (rightPriority === -1) return -1
    return leftPriority - rightPriority
  }),
)

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
  <Transition name="state-fade" mode="out-in">
    <PokeballLoader
      v-if="status === 'loading'"
      key="loading"
      fullscreen
      label="Consultando la ficha Pokémon…"
    />
    <ErrorState
      v-else-if="status === 'error'"
      key="error"
      class="min-h-dvh"
      title="No pudimos abrir esta ficha"
      :description="errorMessage"
      @retry="load"
    />
    <article
      v-else-if="pokemon"
      key="detail"
      class="mx-auto min-h-dvh w-full bg-background lg:max-w-[720px]"
      data-testid="pokemon-detail"
    >
      <header class="relative h-[325px] overflow-hidden">
        <div
          class="motion-detail-hero absolute left-1/2 top-[-260px] h-[520px] w-[520px] -translate-x-1/2 rounded-full"
          :style="{ backgroundColor: heroColor }"
          aria-hidden="true"
        />
        <TypeIcon
          :type="primaryType"
          class="motion-detail-emblem absolute left-1/2 top-[54px] size-[190px] -translate-x-1/2 -rotate-12 text-white opacity-60"
        />

        <Button
          variant="icon"
          size="icon"
          class="absolute left-4 top-3 z-20 text-white hover:bg-white/10"
          aria-label="Volver"
          @click="goBack"
        >
          <ChevronLeft class="size-7" :stroke-width="2.25" />
        </Button>
        <Button
          variant="icon"
          size="icon"
          class="absolute right-4 top-3 z-20 text-white hover:bg-white/10"
          :aria-label="favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
          :aria-pressed="favorite"
          data-testid="favorite-detail"
          @click="toggleFavorite"
        >
          <Transition name="heart-pop" mode="out-in">
            <Heart
              :key="favorite ? 'favorite' : 'available'"
              :class="['size-7', { 'fill-white': favorite }]"
              :stroke-width="2.1"
            />
          </Transition>
        </Button>
        <Button
          variant="icon"
          size="icon"
          class="absolute right-[68px] top-3 z-20 hidden text-white hover:bg-white/10 lg:flex"
          aria-label="Copiar información del Pokémon"
          data-testid="share-pokemon"
          @click="share"
        >
          <Share2 class="size-6" />
        </Button>

        <img
          v-if="pokemon.detailSprite"
          :src="pokemon.detailSprite"
          :alt="pokemon.displayName"
          width="175"
          height="175"
          fetchpriority="high"
          class="motion-detail-sprite absolute left-1/2 top-[136px] z-10 size-[175px] -translate-x-1/2 object-contain opacity-80 mix-blend-multiply [image-rendering:pixelated]"
        />
      </header>

      <div class="motion-detail-body mx-auto min-h-[586px] w-[calc(100%-24px)] max-w-[337px]">
        <section aria-labelledby="pokemon-name">
          <h1 id="pokemon-name" class="text-[26px] font-medium leading-10">
            {{ pokemon.displayName }}
          </h1>
          <p class="mt-1 tabular-nums text-xs text-[var(--text-secondary)]">
            {{ formatPokemonNumber(pokemon.id) }}
          </p>
        </section>

        <div class="mt-8 flex flex-wrap gap-1.5">
          <TypeBadge v-for="type in pokemon.types" :key="type" :type="type" compact />
        </div>

        <p class="mt-6 text-pretty text-xs leading-[18px] text-[var(--text-secondary)]">
          {{ pokemon.description }}
        </p>

        <div class="mt-5 border-t border-[var(--border-default)] pt-5">
          <dl class="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <dt
                class="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--text-secondary)]"
              >
                <Weight class="size-3.5" /> Peso
              </dt>
              <dd
                class="flex h-11 items-center justify-center rounded-xl border border-[var(--border-default)] text-sm font-medium tabular-nums"
              >
                {{ formatWeight(pokemon.weightHectograms) }}
              </dd>
            </div>
            <div>
              <dt
                class="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--text-secondary)]"
              >
                <Ruler class="size-3.5" /> Altura
              </dt>
              <dd
                class="flex h-11 items-center justify-center rounded-xl border border-[var(--border-default)] text-sm font-medium tabular-nums"
              >
                {{ formatHeight(pokemon.heightDecimeters) }}
              </dd>
            </div>
            <div>
              <dt
                class="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--text-secondary)]"
              >
                <Grid2X2 class="size-3.5" /> Categoría
              </dt>
              <dd
                class="flex h-11 items-center justify-center rounded-xl border border-[var(--border-default)] px-2 text-center text-sm font-medium uppercase"
              >
                {{ pokemon.category }}
              </dd>
            </div>
            <div>
              <dt
                class="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--text-secondary)]"
              >
                <CircleDot class="size-3.5" /> Habilidad
              </dt>
              <dd
                class="flex h-11 items-center justify-center rounded-xl border border-[var(--border-default)] px-2 text-center text-sm font-medium"
              >
                {{ pokemon.abilities[0] }}
              </dd>
            </div>
          </dl>
        </div>

        <section class="mt-5" aria-labelledby="gender-heading">
          <h2
            id="gender-heading"
            class="text-center text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--text-secondary)]"
          >
            Género
          </h2>
          <p
            v-if="pokemon.gender.genderless"
            class="mt-3 text-center text-xs text-muted-foreground"
          >
            Sin género
          </p>
          <template v-else>
            <div class="mt-3 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
              <span class="bg-[var(--gender-male)]" :style="{ width: `${pokemon.gender.male}%` }" />
              <span class="min-w-2 flex-1 bg-[var(--gender-female)]" />
            </div>
            <div class="mt-2 flex items-center justify-between text-xs tabular-nums">
              <span class="flex items-center gap-1"
                ><Mars class="size-3.5" />{{ formatPercentage(pokemon.gender.male) }}</span
              >
              <span class="flex items-center gap-1"
                ><Venus class="size-3.5" />{{ formatPercentage(pokemon.gender.female) }}</span
              >
            </div>
          </template>
        </section>

        <section class="mt-10" aria-labelledby="weakness-heading">
          <h2 id="weakness-heading" class="text-[20px] font-medium leading-7">Debilidades</h2>
          <div class="mt-4 flex flex-wrap gap-x-4 gap-y-3">
            <TypeBadge
              v-for="weakness in sortedWeaknesses"
              :key="weakness.type"
              :type="weakness.type"
            />
          </div>
        </section>
      </div>

      <div class="h-[53px]" aria-hidden="true" />
      <AppNavigation class="!static !inset-auto !z-auto lg:hidden" />
    </article>
  </Transition>
</template>
