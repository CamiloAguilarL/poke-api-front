import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { DEFAULT_ONBOARDING_DESTINATION } from './router/onboarding'
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

  if (!preferences.onboardingComplete) {
    if (to.name === 'welcome') return true
    if (to.path === '/') return { name: 'welcome', replace: true }

    return {
      name: 'welcome',
      query: { redirect: to.fullPath },
      replace: true,
    }
  }

  if (to.path === '/' || to.name === 'welcome') return DEFAULT_ONBOARDING_DESTINATION
  return true
})

app.mount('#app')
