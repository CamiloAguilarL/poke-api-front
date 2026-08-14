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
      <template v-if="firstStep">
        <div class="absolute left-1/2 top-[207px] h-[257px] w-[360px] -translate-x-1/2">
          <img
            src="/assets/figma/onboarding-trainer-small.png"
            alt="Entrenador Pokémon"
            class="absolute left-[17px] top-[26px] size-[231px] object-contain"
          />
          <img
            src="/assets/figma/onboarding-trainer-large.png"
            alt="Entrenadora Pokémon"
            class="absolute left-[102px] top-0 size-[257px] object-contain"
          />
        </div>
      </template>
      <img
        v-else
        src="/assets/figma/onboarding-hilda-cutout.png"
        alt="Entrenadora lista para comenzar"
        class="absolute left-1/2 top-[181px] size-[240px] -translate-x-1/2 object-contain [image-rendering:pixelated]"
      />

      <div class="absolute inset-x-4 bottom-[168px] text-center">
        <h1 class="mx-auto w-[321px] text-[26px] font-medium leading-[1.25]">
          {{ firstStep ? 'Todos los Pokémon en un solo lugar' : 'Mantén tu Pokédex actualizada' }}
        </h1>
        <p class="mx-auto mt-4 w-[320px] text-sm leading-6 text-muted-foreground">
          {{
            firstStep
              ? 'Accede a una amplia lista de Pokémon de todas las generaciones creadas por Nintendo'
              : 'Regístrate y guarda tu perfil, Pokémon favoritos, configuraciones y mucho más en la aplicación'
          }}
        </p>
      </div>

      <div
        class="absolute left-1/2 bottom-[122px] flex -translate-x-1/2 items-center gap-2"
        aria-label="Paso del onboarding"
      >
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
      <Button
        class="absolute bottom-10 left-1/2 h-[58px] w-[328px] -translate-x-1/2 rounded-full text-lg"
        @click="continueFlow"
      >
        {{ firstStep ? 'Continuar' : 'Empecemos' }}
      </Button>
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
