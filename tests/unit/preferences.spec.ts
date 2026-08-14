import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePreferencesStore } from '@/stores/preferences'

describe('preferences store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('completes and resets onboarding', () => {
    const store = usePreferencesStore()
    expect(store.onboardingComplete).toBe(false)
    store.completeOnboarding()
    expect(store.onboardingComplete).toBe(true)
    store.resetOnboarding()
    expect(store.onboardingComplete).toBe(false)
  })
})
