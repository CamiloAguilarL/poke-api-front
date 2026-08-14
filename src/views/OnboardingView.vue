<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { usePreferencesStore } from '@/stores/preferences'

const step = ref<0 | 1>(0)
const router = useRouter()
const preferences = usePreferencesStore()
const firstStep = computed(() => step.value === 0)

async function continueFlow() {
  if (firstStep.value) {
    step.value = 1
    return
  }
  preferences.completeOnboarding()
  await router.replace('/pokedex')
}
</script>

<template>
  <main
    class="mx-auto min-h-dvh w-full max-w-[1440px] overflow-hidden bg-background lg:grid lg:grid-cols-[1.1fr_0.9fr]"
  >
    <section
      class="relative mx-auto h-dvh min-h-[700px] w-full max-w-[520px] lg:max-w-none"
      aria-live="polite"
    >
      <div class="absolute inset-x-0 top-[12%] h-[44%] sm:top-[8%] lg:top-[12%]">
        <template v-if="firstStep">
          <img
            src="/assets/figma/onboarding-trainer-small.png"
            alt="Entrenador Pokémon"
            class="absolute bottom-0 left-[5%] h-[78%] max-w-[64%] object-contain"
          />
          <img
            src="/assets/figma/onboarding-trainer-large.png"
            alt="Entrenadora Pokémon"
            class="absolute bottom-0 right-[-2%] h-[88%] max-w-[72%] object-contain"
          />
        </template>
        <img
          v-else
          src="/assets/figma/onboarding-hilda.png"
          alt="Entrenadora lista para comenzar"
          class="absolute bottom-0 left-1/2 h-[92%] -translate-x-1/2 rounded-[32px] object-contain"
        />
      </div>

      <div class="absolute inset-x-4 bottom-10 text-center sm:bottom-8">
        <div class="mx-auto flex max-w-[328px] flex-col items-center">
          <h1 class="text-[26px] font-medium leading-[1.25]">
            {{ firstStep ? 'Todos los Pokémon en un solo lugar' : 'Tu aventura comienza ahora' }}
          </h1>
          <p class="mt-4 text-sm leading-6 text-muted-foreground">
            {{
              firstStep
                ? 'Accede a una amplia lista de Pokémon de todas las generaciones creadas por Nintendo'
                : 'Explora, descubre y guarda tus Pokémon favoritos en una Pokédex hecha para ti.'
            }}
          </p>
          <div class="mt-6 flex items-center gap-2" aria-label="Paso del onboarding">
            <span
              :class="[
                'h-[9px] rounded-full bg-[#173ea5] transition-all',
                firstStep ? 'w-7' : 'w-[9px] opacity-25',
              ]"
            />
            <span
              :class="[
                'h-[9px] rounded-full bg-[#173ea5] transition-all',
                firstStep ? 'w-[9px] opacity-25' : 'w-7',
              ]"
            />
          </div>
          <Button class="mt-6 h-[58px] w-full rounded-full text-lg" @click="continueFlow">
            {{ firstStep ? 'Continuar' : 'Comenzar' }}
          </Button>
        </div>
      </div>
    </section>

    <aside class="hidden items-center justify-center bg-[#eef4fb] px-12 lg:flex">
      <div class="max-w-md">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Pokédex</p>
        <h2 class="mt-4 text-4xl font-semibold leading-tight">
          Todo un mundo Pokémon, también en tu escritorio.
        </h2>
        <p class="mt-5 text-base leading-7 text-muted-foreground">
          La experiencia conserva el flujo mobile del diseño y se expande a un espacio de
          exploración cómodo para web.
        </p>
      </div>
    </aside>
  </main>
</template>
