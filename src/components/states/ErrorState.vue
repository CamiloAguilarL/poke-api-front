<script setup lang="ts">
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    retrying?: boolean
    headingTag?: 'h1' | 'h2'
  }>(),
  {
    title: 'Algo salió mal…',
    description:
      'No pudimos cargar la información en este momento. Verifica tu conexión o intenta nuevamente más tarde.',
    retrying: false,
    headingTag: 'h1',
  },
)
defineEmits<{ retry: [] }>()
</script>

<template>
  <section
    class="flex h-full min-h-[520px] flex-col items-center px-4 pt-[179px] text-center"
    role="alert"
  >
    <img
      src="/assets/figma/error-magikarp.png"
      alt="Magikarp confundido"
      width="181"
      height="210"
      class="h-[210px] w-auto object-contain"
    />
    <component :is="headingTag" class="mt-5 text-balance text-xl font-semibold">
      {{ title }}
    </component>
    <p class="mt-2 max-w-[310px] text-pretty text-sm leading-6 text-muted-foreground">
      {{ description }}
    </p>
    <Button
      class="mt-4 w-full max-w-[328px] rounded-full"
      :loading="retrying"
      @click="$emit('retry')"
    >
      Reintentar
    </Button>
  </section>
</template>
