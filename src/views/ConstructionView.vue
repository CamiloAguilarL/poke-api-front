<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { pokemonRepository } from '@/features/pokemon/api/pokemon-repository'
import type { PokemonSummary } from '@/features/pokemon/domain/models'

const props = defineProps<{ section: string }>()
const router = useRouter()
const jigglypuff = ref<PokemonSummary | null>(null)
const title = computed(() => `${props.section}: muy pronto`)

onMounted(async () => {
  try {
    jigglypuff.value = await pokemonRepository.getSummary('jigglypuff')
  } catch {
    jigglypuff.value = null
  }
})
</script>

<template>
  <section
    class="flex min-h-[calc(100dvh-77px)] items-center justify-center bg-background px-6 text-center lg:min-h-dvh"
  >
    <div class="max-w-sm">
      <div
        class="relative mx-auto flex size-52 items-center justify-center rounded-full bg-[var(--surface-feminine)]"
      >
        <span
          class="absolute inset-5 rounded-full border-[18px] border-[var(--art-ring)]"
          aria-hidden="true"
        />
        <img
          v-if="jigglypuff?.sprite"
          :src="jigglypuff.sprite"
          :alt="jigglypuff.displayName"
          class="relative size-40 object-contain"
        />
        <span v-else class="relative text-7xl" aria-hidden="true">?</span>
      </div>
      <h1 class="mt-7 text-[26px] font-semibold">{{ title }}</h1>
      <p class="mt-3 text-sm leading-6 text-muted-foreground">
        Estamos preparando esta sección. Mientras tanto, puedes seguir explorando y guardando
        Pokémon.
      </p>
      <Button class="mt-6" @click="router.push('/pokedex')">Volver a la Pokédex</Button>
    </div>
  </section>
</template>
