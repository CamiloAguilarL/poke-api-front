import type { PokemonDetail } from './models'
import { TYPE_META } from './type-meta'

const decimalFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export function formatPokemonName(value: string): string {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

export function formatPokemonNumber(id: number): string {
  return `Nº${String(id).padStart(3, '0')}`
}

export function formatWeight(hectograms: number): string {
  return `${decimalFormatter.format(hectograms / 10)} kg`
}

export function formatHeight(decimeters: number): string {
  return `${decimalFormatter.format(decimeters / 10)} m`
}

export function formatPercentage(value: number): string {
  return `${decimalFormatter.format(value)}%`
}

function cleanClipboardValue(value: string): string {
  return value.replaceAll(',', ';').replaceAll(/\s+/g, ' ').trim()
}

export function formatSharePayload(pokemon: PokemonDetail): string {
  const gender = pokemon.gender.genderless
    ? 'Sin género'
    : `${formatPercentage(pokemon.gender.male)} masculino / ${formatPercentage(pokemon.gender.female)} femenino`

  const segments = [
    `Nombre: ${pokemon.displayName}`,
    `Número: ${formatPokemonNumber(pokemon.id)}`,
    `Tipos: ${pokemon.types.map((type) => TYPE_META[type].label).join(' / ')}`,
    `Descripción: ${cleanClipboardValue(pokemon.description)}`,
    `Peso: ${formatWeight(pokemon.weightHectograms)}`,
    `Altura: ${formatHeight(pokemon.heightDecimeters)}`,
    `Categoría: ${pokemon.category}`,
    `Habilidades: ${pokemon.abilities.join(' / ')}`,
    `Género: ${gender}`,
    `Debilidades: ${pokemon.weaknesses.map(({ type, multiplier }) => `${TYPE_META[type].label} ×${multiplier}`).join(' / ')}`,
  ]

  return segments.join(', ')
}
