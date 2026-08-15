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
    class="min-h-dvh min-w-full bg-background lg:grid lg:h-dvh lg:grid-cols-[104px_minmax(0,1fr)] lg:overflow-hidden"
    data-testid="app-shell"
  >
    <AppNavigation :class="{ 'max-lg:hidden': hideMobileNavigation }" />
    <main id="main-content" class="min-h-dvh min-w-0 lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition name="page-view" mode="out-in">
          <component :is="Component" :key="currentRoute.matched[1]?.path ?? currentRoute.path" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
