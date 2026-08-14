<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import CatalogPanel from '@/components/catalog/CatalogPanel.vue'

const route = useRoute()
const hasDetail = computed(() => route.name === 'pokemon-detail')
</script>

<template>
  <div
    class="min-h-dvh bg-background lg:grid"
    :class="
      hasDetail
        ? 'lg:grid-cols-[420px_minmax(0,1fr)] lg:divide-x lg:divide-border'
        : 'lg:grid-cols-1'
    "
  >
    <CatalogPanel :expanded="!hasDetail" :class="{ 'max-lg:hidden': hasDetail }" />
    <div v-if="hasDetail" class="min-w-0 bg-background">
      <RouterView />
    </div>
  </div>
</template>
