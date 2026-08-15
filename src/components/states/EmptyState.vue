<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    headingTag?: 'h1' | 'h2'
  }>(),
  {
    title: 'No has marcado ningún Pokémon como favorito',
    description: 'Haz clic en el icono de corazón de tus Pokémon favoritos y aparecerán aquí.',
    headingTag: 'h1',
  },
)
</script>

<template>
  <section
    class="flex min-h-[calc(100dvh-77px)] translate-y-16 flex-col items-center justify-center px-6 pb-5 text-center lg:min-h-dvh lg:translate-y-0"
  >
    <img
      src="/assets/figma/error-magikarp.png"
      alt="Magikarp sin favoritos"
      width="181"
      height="210"
      class="h-[210px] w-auto object-contain"
    />
    <component
      :is="headingTag"
      class="mt-5 max-w-[270px] text-balance text-xl font-semibold leading-7"
    >
      {{ title }}
    </component>
    <p class="mt-2 max-w-[300px] text-pretty text-xs leading-[18px] text-muted-foreground">
      {{ description }}
    </p>
  </section>
</template>
