<script setup lang="ts">
import { Heart } from '@lucide/vue'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    actionLabel?: string
    showHeart?: boolean
  }>(),
  {
    title: 'Aún no tienes favoritos',
    description: 'Guarda los Pokémon que más te gusten tocando el corazón.',
    actionLabel: 'Explorar Pokédex',
    showHeart: true,
  },
)
defineEmits<{ action: [] }>()
</script>

<template>
  <section class="flex h-full min-h-[460px] flex-col items-center justify-center px-6 text-center">
    <div
      v-if="showHeart"
      class="flex size-24 items-center justify-center rounded-full bg-[#ffebee]"
    >
      <Heart class="size-11 fill-[var(--favorite)] text-[var(--favorite)]" />
    </div>
    <h1 class="mt-6 text-xl font-semibold">{{ title }}</h1>
    <p class="mt-2 max-w-[310px] text-sm leading-6 text-muted-foreground">{{ description }}</p>
    <Button class="mt-6" @click="$emit('action')">{{ actionLabel }}</Button>
  </section>
</template>
