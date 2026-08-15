<script setup lang="ts">
import SectionHeader from '@/components/layout/SectionHeader.vue'

defineProps<{ section: string }>()
</script>

<template>
  <section class="flex h-[calc(100dvh-77px)] flex-col bg-background lg:h-dvh">
    <SectionHeader :title="section" />
    <div class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-6 text-center">
      <img
        src="/assets/figma/construction-jigglypuff.jpg"
        alt="Jigglypuff esperando nuevas funciones"
        width="180"
        height="180"
        class="size-[180px] object-cover"
      />
      <h2 class="mt-10 text-balance text-[22px] font-semibold leading-7">
        ¡Muy pronto disponible!
      </h2>
      <p class="mt-3 max-w-[320px] text-pretty text-sm leading-6 text-muted-foreground">
        Estamos trabajando para traerte esta sección. Vuelve más adelante para descubrir todas las
        novedades.
      </p>
    </div>
  </section>
</template>
