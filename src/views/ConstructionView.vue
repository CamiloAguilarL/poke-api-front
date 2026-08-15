<script setup lang="ts">
defineProps<{ section: string }>()
</script>

<template>
  <section
    class="flex min-h-[calc(100dvh-77px)] flex-col items-center bg-background px-6 pt-[227px] text-center lg:min-h-dvh lg:justify-center lg:pt-0"
    :aria-label="section"
  >
    <img
      src="/assets/figma/construction-jigglypuff.jpg"
      alt="Jigglypuff esperando nuevas funciones"
      width="180"
      height="180"
      class="motion-state-art size-[180px] object-cover"
    />
    <h1 class="mt-10 text-balance text-[22px] font-semibold leading-7">¡Muy pronto disponible!</h1>
    <p class="mt-3 max-w-[320px] text-pretty text-sm leading-6 text-muted-foreground">
      Estamos trabajando para traerte esta sección. Vuelve más adelante para descubrir todas las
      novedades.
    </p>
  </section>
</template>
