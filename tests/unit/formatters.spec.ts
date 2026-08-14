import { describe, expect, it } from 'vitest'
import {
  formatHeight,
  formatPercentage,
  formatPokemonName,
  formatPokemonNumber,
  formatSharePayload,
  formatWeight,
} from '@/features/pokemon/domain/formatters'
import type { PokemonDetail } from '@/features/pokemon/domain/models'

const bulbasaur: PokemonDetail = {
  id: 1,
  name: 'bulbasaur',
  displayName: 'Bulbasaur',
  sprite: 'sprite.png',
  artwork: 'artwork.png',
  types: ['grass', 'poison'],
  description: 'Una rara semilla, crece con este Pokémon.',
  weightHectograms: 69,
  heightDecimeters: 7,
  category: 'Semilla',
  abilities: ['Espesura', 'Clorofila'],
  gender: { genderless: false, male: 87.5, female: 12.5 },
  weaknesses: [
    { type: 'fire', multiplier: 2 },
    { type: 'psychic', multiplier: 2 },
  ],
  evolutions: [
    { id: 1, name: 'bulbasaur', displayName: 'Bulbasaur', sprite: 'sprite.png' },
    { id: 2, name: 'ivysaur', displayName: 'Ivysaur', sprite: 'sprite.png' },
  ],
}

describe('pokemon formatters', () => {
  it('normalizes names, identifiers and metric units', () => {
    expect(formatPokemonName('mr-mime')).toBe('Mr Mime')
    expect(formatPokemonNumber(25)).toBe('Nº025')
    expect(formatPokemonNumber(10080)).toBe('Nº10080')
    expect(formatWeight(69)).toBe('6,9 kg')
    expect(formatHeight(7)).toBe('0,7 m')
    expect(formatPercentage(87.5)).toBe('87,5%')
  })

  it('copies every visible attribute as comma-separated segments', () => {
    const payload = formatSharePayload(bulbasaur)

    expect(payload.split(', ')).toHaveLength(11)
    expect(payload).toContain('Nombre: Bulbasaur')
    expect(payload).toContain('Tipos: Planta / Veneno')
    expect(payload).toContain('Descripción: Una rara semilla; crece con este Pokémon.')
    expect(payload).toContain('Género: 87,5% masculino / 12,5% femenino')
    expect(payload).toContain('Evoluciones: Bulbasaur / Ivysaur')
  })

  it('handles genderless Pokémon and absent evolutions', () => {
    const payload = formatSharePayload({
      ...bulbasaur,
      gender: { genderless: true, male: 0, female: 0 },
      evolutions: [],
    })

    expect(payload).toContain('Género: Sin género')
    expect(payload).not.toContain('Evoluciones:')
  })
})
