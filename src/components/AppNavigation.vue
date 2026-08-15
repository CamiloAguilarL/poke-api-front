<script setup lang="ts">
import favoriteIcon from '@material-design-icons/svg/filled/favorite.svg'
import homeIcon from '@material-design-icons/svg/filled/home.svg'
import languageIcon from '@material-design-icons/svg/filled/language.svg'
import personIcon from '@material-design-icons/svg/filled/person.svg'
import { Link } from '@/components/ui/link'
import NavigationIcon from '@/components/navigation/NavigationIcon.vue'

interface NavigationItem {
  label: string
  to: string
  icon: string
}

const items: NavigationItem[] = [
  { label: 'Pokédex', to: '/pokedex', icon: homeIcon },
  { label: 'Regiones', to: '/regions', icon: languageIcon },
  { label: 'Favoritos', to: '/favorites', icon: favoriteIcon },
  { label: 'Perfil', to: '/profile', icon: personIcon },
]
</script>

<template>
  <nav
    class="safe-bottom fixed inset-x-0 bottom-0 z-30 flex h-[77px] items-center justify-around rounded-t-2xl border-t border-border bg-background px-4 lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:justify-center lg:rounded-none lg:border-r lg:border-t-0 lg:px-2 lg:py-6"
    aria-label="Navegación principal"
  >
    <Link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      variant="navigation"
      active-class="!text-[var(--navigation-active)]"
    >
      <NavigationIcon :src="item.icon" class="transition-transform group-active:scale-90" />
      <span>{{ item.label }}</span>
    </Link>
  </nav>
</template>
