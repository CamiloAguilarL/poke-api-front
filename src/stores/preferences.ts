import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePreferencesStore = defineStore('preferences', () => {
  const onboardingComplete = ref(false)

  function completeOnboarding() {
    onboardingComplete.value = true
  }

  function resetOnboarding() {
    onboardingComplete.value = false
  }

  return { onboardingComplete, completeOnboarding, resetOnboarding }
})
