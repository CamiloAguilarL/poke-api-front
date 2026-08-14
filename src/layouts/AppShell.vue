<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'

const route = useRoute()
const hideMobileNavigation = computed(() => Boolean(route.meta.hideMobileNav))
</script>

<template>
  <div
    class="min-h-dvh w-full bg-background lg:grid lg:grid-cols-[104px_minmax(0,1fr)]"
    data-testid="app-shell"
  >
    <AppNavigation :class="{ 'max-lg:hidden': hideMobileNavigation }" />
    <main :class="['min-w-0 lg:pb-0', hideMobileNavigation ? 'pb-0' : 'pb-[77px]']">
      <RouterView />
    </main>
  </div>
</template>
