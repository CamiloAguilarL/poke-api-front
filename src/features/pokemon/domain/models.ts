export const POKEMON_TYPES = [
  'normal',
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
] as const

export type PokemonTypeName = (typeof POKEMON_TYPES)[number]

export interface CatalogEntry {
  id: number
  name: string
}

export interface PokemonSummary extends CatalogEntry {
  displayName: string
  sprite: string | null
  artwork: string | null
  types: PokemonTypeName[]
}

export interface GenderBreakdown {
  genderless: boolean
  male: number
  female: number
}

export interface Weakness {
  type: PokemonTypeName
  multiplier: number
}

export interface EvolutionStage extends CatalogEntry {
  displayName: string
  sprite: string | null
}

export interface PokemonDetail extends PokemonSummary {
  description: string
  weightHectograms: number
  heightDecimeters: number
  category: string
  abilities: string[]
  gender: GenderBreakdown
  weaknesses: Weakness[]
  evolutions: EvolutionStage[]
}

export interface PokemonCatalogQuery {
  query: string
  types: PokemonTypeName[]
  limit: number
  offset: number
}

export interface PokemonSummaryPage {
  count: number
  summaries: PokemonSummary[]
  nextOffset: number | null
}

export function isPokemonType(value: string): value is PokemonTypeName {
  return (POKEMON_TYPES as readonly string[]).includes(value)
}
