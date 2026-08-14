import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { persistedStatePlugin } from './stores/persisted-state'
import { usePreferencesStore } from './stores/preferences'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()

pinia.use(persistedStatePlugin)
app.use(pinia)
app.use(router)

router.beforeEach((to) => {
  const preferences = usePreferencesStore(pinia)
  if (to.path === '/') return preferences.onboardingComplete ? '/pokedex' : '/welcome'
  if (to.path === '/welcome' && preferences.onboardingComplete) return '/pokedex'
  return true
})

app.mount('#app')
