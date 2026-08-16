<script setup lang="ts">
import { ChevronLeft, CircleDot, Grid2X2, Mars, Ruler, Share2, Venus, Weight } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'
import FavoriteButton from '@/components/favorites/FavoriteButton.vue'
import TypeBadge from '@/components/pokemon/TypeBadge.vue'
import TypeIcon from '@/components/pokemon/TypeIcon.vue'
import ErrorState from '@/components/states/ErrorState.vue'
import PokeballLoader from '@/components/PokeballLoader.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
const route = useRoute()
const router = useRouter()
const favorites = useFavoritesStore()
const pokemon = ref<PokemonDetail | null>(null)
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
const favorite = computed(() => (pokemon.value ? favorites.has(pokemon.value.name) : false))
const primaryType = computed(() => pokemon.value?.types[0] ?? 'normal')
const heroColor = computed(() => TYPE_META[primaryType.value].color)
const mobileDetailImage = computed(
  () => pokemon.value?.animatedSprite ?? pokemon.value?.sprite ?? pokemon.value?.artwork ?? null,
)
const desktopDetailImage = computed(
  () => pokemon.value?.artwork ?? pokemon.value?.sprite ?? pokemon.value?.animatedSprite ?? null,
)
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
  const previousRoute = window.history.state?.back
  if (typeof previousRoute === 'string' && previousRoute.startsWith('/')) {
    router.back()
    return
  }
  void router.push(route.name === 'favorite-detail' ? '/favorites' : '/pokedex')
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
      class="mx-auto min-h-dvh w-full bg-background"
      data-testid="pokemon-detail"
    >
      <div class="lg:hidden" data-testid="mobile-pokemon-detail">
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
          <FavoriteButton
            :favorite="favorite"
            class="absolute right-4 top-3 z-20"
            data-testid="favorite-detail-mobile"
            @toggle="toggleFavorite"
          />

          <img
            v-if="mobileDetailImage"
            :src="mobileDetailImage"
            :alt="pokemon.displayName"
            width="128"
            height="132"
            crossorigin="anonymous"
            fetchpriority="high"
            class="motion-detail-sprite absolute left-1/2 top-[112px] z-10 h-[132px] w-32 -translate-x-1/2 object-contain [image-rendering:pixelated] sm:top-[100px] sm:h-[156px] sm:w-[152px]"
          />
        </header>

        <div class="motion-detail-body mx-auto min-h-[586px] w-[calc(100%-24px)] max-w-[337px]">
          <section aria-labelledby="pokemon-name-mobile">
            <h1 id="pokemon-name-mobile" class="text-[26px] font-medium leading-10">
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

          <section class="mt-5" aria-labelledby="gender-heading-mobile">
            <h2
              id="gender-heading-mobile"
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
                <span
                  class="bg-[var(--gender-male)]"
                  :style="{ width: `${pokemon.gender.male}%` }"
                />
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

          <section class="mt-10" aria-labelledby="weakness-heading-mobile">
            <h2 id="weakness-heading-mobile" class="text-[20px] font-medium leading-7">
              Debilidades
            </h2>
            <div class="mt-4 flex flex-wrap gap-x-4 gap-y-3">
              <TypeBadge
                v-for="weakness in sortedWeaknesses"
                :key="weakness.type"
                :type="weakness.type"
              />
            </div>
          </section>
        </div>

        <div class="h-[77px]" aria-hidden="true" />
        <AppNavigation />
      </div>

      <div class="hidden min-h-dvh lg:block" data-testid="desktop-pokemon-detail">
        <header
          class="sticky top-0 z-30 border-b border-[var(--border-default)] bg-background/95 px-8 py-3 backdrop-blur-md"
        >
          <div class="mx-auto flex max-w-[1120px] items-center justify-between gap-6">
            <Button
              variant="secondary"
              size="sm"
              class="h-10 rounded-full border border-[var(--border-default)] bg-card px-4 shadow-sm"
              data-testid="desktop-detail-back"
              @click="goBack"
            >
              <ChevronLeft class="size-5" aria-hidden="true" />
              Volver al catálogo
            </Button>

            <p class="min-w-0 truncate text-sm font-medium text-[var(--text-secondary)]">
              {{ formatPokemonNumber(pokemon.id) }} · {{ pokemon.displayName }}
            </p>

            <div class="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                class="h-10 rounded-full border border-[var(--border-default)] bg-card"
                aria-label="Copiar información del Pokémon"
                data-testid="share-pokemon"
                @click="share"
              >
                <Share2 class="size-4" aria-hidden="true" />
                Copiar
              </Button>
              <FavoriteButton
                :favorite="favorite"
                data-testid="favorite-detail"
                @toggle="toggleFavorite"
              />
            </div>
          </div>
        </header>

        <div
          class="mx-auto grid max-w-[1120px] grid-cols-1 items-start gap-10 px-8 py-8 min-[1280px]:grid-cols-[minmax(250px,0.78fr)_minmax(350px,1.22fr)] xl:gap-14 xl:px-10"
        >
          <section
            class="desktop-pokemon-hero relative h-[460px] overflow-hidden rounded-[28px] p-8 text-[var(--hero-foreground)] min-[1280px]:sticky min-[1280px]:top-[96px] min-[1280px]:h-[calc(100dvh-128px)] min-[1280px]:min-h-[620px] min-[1280px]:max-h-[760px]"
            :style="{ '--detail-color': heroColor }"
            aria-label="Ilustración del Pokémon"
          >
            <TypeIcon
              :type="primaryType"
              class="absolute -right-14 top-12 size-[330px] -rotate-12 text-white opacity-20"
            />
            <div class="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.12em] text-white/75">
                  Ficha Pokémon
                </p>
                <p class="mt-1 tabular-nums text-sm font-medium text-white/85">
                  {{ formatPokemonNumber(pokemon.id) }}
                </p>
              </div>
              <div class="flex flex-wrap justify-end gap-1.5">
                <TypeBadge v-for="type in pokemon.types" :key="type" :type="type" compact />
              </div>
            </div>

            <img
              v-if="desktopDetailImage"
              :src="desktopDetailImage"
              :alt="pokemon.displayName"
              width="420"
              height="420"
              fetchpriority="high"
              class="desktop-pokemon-artwork absolute left-1/2 top-1/2 z-10 h-auto w-[88%] max-w-[440px] -translate-x-1/2 -translate-y-[47%] object-contain"
            />

            <div class="absolute inset-x-8 bottom-8 z-10">
              <p class="text-[36px] font-semibold leading-tight text-white">
                {{ pokemon.displayName }}
              </p>
              <p class="mt-2 max-w-[360px] text-pretty text-sm leading-6 text-white/80">
                {{ pokemon.category }} · {{ pokemon.abilities.join(', ') }}
              </p>
            </div>
          </section>

          <div class="motion-detail-body min-w-0 pb-14">
            <section aria-labelledby="pokemon-name">
              <p
                class="tabular-nums text-xs font-semibold uppercase tracking-[0.14em] text-[var(--navigation-active)]"
              >
                {{ formatPokemonNumber(pokemon.id) }}
              </p>
              <h1
                id="pokemon-name"
                class="mt-2 text-balance text-[36px] font-semibold leading-tight"
              >
                {{ pokemon.displayName }}
              </h1>
              <div class="mt-4 flex flex-wrap gap-2">
                <TypeBadge v-for="type in pokemon.types" :key="type" :type="type" />
              </div>
              <p class="mt-6 text-pretty text-sm leading-7 text-[var(--text-secondary)]">
                {{ pokemon.description }}
              </p>
            </section>

            <section
              class="mt-8 border-t border-[var(--border-default)] pt-7"
              aria-labelledby="features-heading"
            >
              <h2 id="features-heading" class="text-xl font-semibold">Características</h2>
              <dl class="mt-4 grid grid-cols-2 gap-3">
                <Card as="div" class="p-4 shadow-none">
                  <dt
                    class="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    <Weight class="size-4" aria-hidden="true" /> Peso
                  </dt>
                  <dd class="mt-3 tabular-nums text-lg font-semibold">
                    {{ formatWeight(pokemon.weightHectograms) }}
                  </dd>
                </Card>
                <Card as="div" class="p-4 shadow-none">
                  <dt
                    class="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    <Ruler class="size-4" aria-hidden="true" /> Altura
                  </dt>
                  <dd class="mt-3 tabular-nums text-lg font-semibold">
                    {{ formatHeight(pokemon.heightDecimeters) }}
                  </dd>
                </Card>
                <Card as="div" class="p-4 shadow-none">
                  <dt
                    class="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    <Grid2X2 class="size-4" aria-hidden="true" /> Categoría
                  </dt>
                  <dd class="mt-3 truncate text-base font-semibold">{{ pokemon.category }}</dd>
                </Card>
                <Card as="div" class="p-4 shadow-none">
                  <dt
                    class="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    <CircleDot class="size-4" aria-hidden="true" /> Habilidades
                  </dt>
                  <dd class="mt-3 line-clamp-2 text-base font-semibold">
                    {{ pokemon.abilities.join(', ') }}
                  </dd>
                </Card>
              </dl>
            </section>

            <section class="mt-8" aria-labelledby="gender-heading">
              <h2 id="gender-heading" class="text-xl font-semibold">Género</h2>
              <Card
                v-if="pokemon.gender.genderless"
                class="mt-4 border-transparent bg-[var(--surface-subtle)] p-5 shadow-none"
              >
                <p class="text-sm text-[var(--text-secondary)]">Este Pokémon no tiene género.</p>
              </Card>
              <div v-else class="mt-4 grid grid-cols-2 gap-3">
                <Card class="border-transparent bg-[var(--surface-masculine)] p-5 shadow-none">
                  <Mars class="size-5 text-[var(--gender-male)]" aria-hidden="true" />
                  <p class="mt-3 text-xs text-[var(--text-secondary)]">Masculino</p>
                  <p class="mt-1 tabular-nums text-lg font-semibold">
                    {{ formatPercentage(pokemon.gender.male) }}
                  </p>
                </Card>
                <Card class="border-transparent bg-[var(--surface-feminine)] p-5 shadow-none">
                  <Venus class="size-5 text-[var(--gender-female)]" aria-hidden="true" />
                  <p class="mt-3 text-xs text-[var(--text-secondary)]">Femenino</p>
                  <p class="mt-1 tabular-nums text-lg font-semibold">
                    {{ formatPercentage(pokemon.gender.female) }}
                  </p>
                </Card>
              </div>
            </section>

            <section class="mt-8" aria-labelledby="weakness-heading">
              <h2 id="weakness-heading" class="text-xl font-semibold">Debilidades</h2>
              <div class="mt-4 flex flex-wrap gap-3">
                <div v-for="weakness in sortedWeaknesses" :key="weakness.type" class="relative">
                  <TypeBadge :type="weakness.type" />
                  <span
                    v-if="weakness.multiplier > 2"
                    class="absolute -right-2 -top-2 rounded-full border border-[var(--border-default)] bg-card px-1.5 py-0.5 text-[9px] font-bold tabular-nums shadow-sm"
                  >
                    ×{{ weakness.multiplier }}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  </Transition>
</template>

<style scoped>
.desktop-pokemon-hero {
  background:
    radial-gradient(circle at 82% 22%, var(--hero-spot-strong) 0 72px, transparent 73px),
    radial-gradient(circle at 15% 84%, var(--hero-spot-soft) 0 96px, transparent 97px),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--detail-color) 82%, var(--surface-card)),
      var(--detail-color)
    );
}

.desktop-pokemon-hero::after {
  position: absolute;
  right: -88px;
  bottom: -92px;
  width: 320px;
  height: 320px;
  border: 38px solid var(--hero-ring);
  border-radius: 50%;
  content: '';
}

.desktop-pokemon-artwork {
  filter: drop-shadow(var(--shadow-sprite));
}
</style>
