import { describe, expect, it } from 'vitest'
import { DEFAULT_ONBOARDING_DESTINATION, resolveOnboardingDestination } from '@/router/onboarding'

describe('onboarding navigation', () => {
  it('preserves safe internal destinations', () => {
    expect(resolveOnboardingDestination('/favorites')).toBe('/favorites')
    expect(resolveOnboardingDestination('/pokedex/bulbasaur?source=direct#details')).toBe(
      '/pokedex/bulbasaur?source=direct#details',
    )
  })

  it.each([
    undefined,
    null,
    [],
    '/',
    '/welcome',
    '/welcome?redirect=/profile',
    '//example.com',
    'https://example.com',
  ])('falls back to the Pokédex for an invalid destination: %s', (destination) => {
    expect(resolveOnboardingDestination(destination)).toBe(DEFAULT_ONBOARDING_DESTINATION)
  })
})
