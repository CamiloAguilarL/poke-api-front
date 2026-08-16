export const DEFAULT_ONBOARDING_DESTINATION = '/pokedex'

export function resolveOnboardingDestination(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value === '/' ||
    value.startsWith('/welcome')
  ) {
    return DEFAULT_ONBOARDING_DESTINATION
  }

  return value
}
