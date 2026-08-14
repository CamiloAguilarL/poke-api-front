<script setup lang="ts">
import { CircleUserRound, Heart, MapPinned, Search } from '@lucide/vue'
import type { Component } from 'vue'
import { Link } from '@/components/ui/link'

interface NavigationItem {
  label: string
  to: string
  icon: Component
}

const items: NavigationItem[] = [
  { label: 'Pokédex', to: '/pokedex', icon: Search },
  { label: 'Regiones', to: '/regions', icon: MapPinned },
  { label: 'Favoritos', to: '/favorites', icon: Heart },
  { label: 'Perfil', to: '/profile', icon: CircleUserRound },
]
</script>

<template>
  <nav
    class="safe-bottom fixed inset-x-0 bottom-0 z-30 flex h-[77px] items-start justify-around border-t border-border bg-card pt-2 lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:justify-center lg:border-r lg:border-t-0 lg:px-2 lg:py-6"
    aria-label="Navegación principal"
  >
    <Link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      variant="navigation"
      active-class="!text-[var(--navigation-active)]"
    >
      <component
        :is="item.icon"
        class="size-5 transition-transform group-active:scale-90"
        :stroke-width="2.2"
      />
      <span>{{ item.label }}</span>
    </Link>
  </nav>
</template>
