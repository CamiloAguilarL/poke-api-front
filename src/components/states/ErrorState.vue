<script setup lang="ts">
import { Button } from '@/components/ui/button'

withDefaults(defineProps<{ title?: string; description?: string; retrying?: boolean }>(), {
  title: 'Algo salió mal',
  description: 'No pudimos conectarnos con la Pokédex. Revisa tu conexión e inténtalo de nuevo.',
  retrying: false,
})
defineEmits<{ retry: [] }>()
</script>

<template>
  <section
    class="flex h-full min-h-[520px] flex-col items-center justify-center px-6 text-center"
    role="alert"
  >
    <img
      src="/assets/figma/error-magikarp.png"
      alt="Magikarp confundido"
      class="h-[210px] w-auto object-contain"
    />
    <h1 class="mt-5 text-xl font-semibold">{{ title }}</h1>
    <p class="mt-2 max-w-[310px] text-sm leading-6 text-muted-foreground">{{ description }}</p>
    <Button class="mt-6 min-w-40" :loading="retrying" @click="$emit('retry')">Reintentar</Button>
  </section>
</template>
