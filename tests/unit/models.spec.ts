import { describe, expect, it } from 'vitest'
import { isPokemonType, POKEMON_TYPES } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'

describe('Pokémon type domain', () => {
  it('recognizes the complete PokeAPI type set', () => {
    expect(POKEMON_TYPES).toHaveLength(18)
    expect(POKEMON_TYPES.every(isPokemonType)).toBe(true)
    expect(isPokemonType('shadow')).toBe(false)
  })

  it('maps every type to a localized design token and Figma icon', () => {
    for (const type of POKEMON_TYPES) {
      expect(TYPE_META[type].label).toBeTruthy()
      expect(TYPE_META[type].color).toBe(`var(--type-${type})`)
      expect(TYPE_META[type].icon).toBe(`/assets/types/${type}.svg`)
    }
  })
})
