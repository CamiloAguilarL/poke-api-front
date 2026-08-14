<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import CatalogPanel from '@/components/catalog/CatalogPanel.vue'

const route = useRoute()
const hasDetail = computed(() => route.name === 'pokemon-detail')
</script>

<template>
  <div
    class="bg-background lg:grid lg:min-h-dvh lg:grid-cols-[420px_minmax(0,1fr)] lg:divide-x lg:divide-border"
  >
    <CatalogPanel :class="{ 'max-lg:hidden': hasDetail }" />
    <div :class="['min-w-0 bg-background', { 'max-lg:hidden': !hasDetail }]">
      <RouterView />
      <section
        v-if="!hasDetail"
        class="hidden h-dvh items-center justify-center bg-[var(--surface-panel)] px-8 text-center lg:flex"
      >
        <div class="max-w-sm">
          <div
            class="mx-auto flex size-24 items-center justify-center rounded-full bg-card shadow-sm"
          >
            <span class="text-5xl" aria-hidden="true">⚡</span>
          </div>
          <h1 class="mt-6 text-2xl font-semibold">Elige un Pokémon</h1>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Explora el catálogo y abre una ficha para ver sus características sin perder tu
            búsqueda.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
