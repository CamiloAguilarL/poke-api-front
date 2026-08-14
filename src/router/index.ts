import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import ConstructionView from '@/views/ConstructionView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import PokedexShell from '@/views/PokedexShell.vue'
import PokemonDetailView from '@/views/PokemonDetailView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: { template: '<div />' } },
    { path: '/welcome', name: 'welcome', component: OnboardingView },
    {
      path: '/',
      component: AppShell,
      children: [
        {
          path: 'pokedex',
          component: PokedexShell,
          children: [
            { path: '', name: 'pokedex', component: { template: '<div />' } },
            {
              path: ':name',
              name: 'pokemon-detail',
              component: PokemonDetailView,
              props: true,
              meta: { hideMobileNav: true },
            },
          ],
        },
        { path: 'favorites', name: 'favorites', component: FavoritesView },
        {
          path: 'favorites/:name',
          name: 'favorite-detail',
          component: PokemonDetailView,
          props: true,
          meta: { hideMobileNav: true },
        },
        {
          path: 'regions',
          name: 'regions',
          component: ConstructionView,
          props: { section: 'Regiones' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: ConstructionView,
          props: { section: 'Perfil' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
