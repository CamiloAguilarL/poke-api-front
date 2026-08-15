<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import CatalogPanel from '@/components/catalog/CatalogPanel.vue'

const route = useRoute()
const hasDetail = computed(() => route.name === 'pokemon-detail')
</script>

<template>
  <div
    class="min-h-dvh bg-background lg:grid lg:h-dvh lg:min-h-0 lg:overflow-hidden"
    :class="
      hasDetail
        ? 'lg:grid-cols-[420px_minmax(0,1fr)] lg:divide-x lg:divide-border'
        : 'lg:grid-cols-1'
    "
  >
    <CatalogPanel :expanded="!hasDetail" :class="{ 'max-lg:hidden': hasDetail }" />
    <Transition name="detail-panel">
      <div
        v-if="hasDetail"
        class="min-w-0 bg-background lg:h-dvh lg:overflow-y-auto lg:overscroll-contain"
        data-testid="pokemon-detail-scroll-panel"
      >
        <RouterView v-slot="{ Component, route: detailRoute }">
          <Transition name="detail-content" mode="out-in">
            <component :is="Component" :key="detailRoute.fullPath" />
          </Transition>
        </RouterView>
      </div>
    </Transition>
  </div>
</template>
