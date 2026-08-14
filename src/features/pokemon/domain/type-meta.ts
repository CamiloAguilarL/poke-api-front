import type { PokemonTypeName } from './models'

export interface PokemonTypeMeta {
  label: string
  color: string
  icon: string
  darkText?: boolean
}

export const TYPE_META: Record<PokemonTypeName, PokemonTypeMeta> = {
  normal: {
    label: 'Normal',
    color: 'var(--type-normal)',
    icon: '/assets/types/normal.svg',
    darkText: true,
  },
  fighting: {
    label: 'Lucha',
    color: 'var(--type-fighting)',
    icon: '/assets/types/fighting.svg',
    darkText: true,
  },
  flying: {
    label: 'Volador',
    color: 'var(--type-flying)',
    icon: '/assets/types/flying.svg',
    darkText: true,
  },
  poison: { label: 'Veneno', color: 'var(--type-poison)', icon: '/assets/types/poison.svg' },
  ground: {
    label: 'Tierra',
    color: 'var(--type-ground)',
    icon: '/assets/types/ground.svg',
    darkText: true,
  },
  rock: { label: 'Roca', color: 'var(--type-rock)', icon: '/assets/types/rock.svg' },
  bug: {
    label: 'Bicho',
    color: 'var(--type-bug)',
    icon: '/assets/types/bug.svg',
    darkText: true,
  },
  ghost: { label: 'Fantasma', color: 'var(--type-ghost)', icon: '/assets/types/ghost.svg' },
  steel: { label: 'Acero', color: 'var(--type-steel)', icon: '/assets/types/steel.svg' },
  fire: {
    label: 'Fuego',
    color: 'var(--type-fire)',
    icon: '/assets/types/fire.svg',
    darkText: true,
  },
  water: {
    label: 'Agua',
    color: 'var(--type-water)',
    icon: '/assets/types/water.svg',
    darkText: true,
  },
  grass: {
    label: 'Planta',
    color: 'var(--type-grass)',
    icon: '/assets/types/grass.svg',
    darkText: true,
  },
  electric: {
    label: 'Eléctrico',
    color: 'var(--type-electric)',
    icon: '/assets/types/electric.svg',
    darkText: true,
  },
  psychic: { label: 'Psíquico', color: 'var(--type-psychic)', icon: '/assets/types/psychic.svg' },
  ice: {
    label: 'Hielo',
    color: 'var(--type-ice)',
    icon: '/assets/types/ice.svg',
    darkText: true,
  },
  dragon: {
    label: 'Dragón',
    color: 'var(--type-dragon)',
    icon: '/assets/types/dragon.svg',
    darkText: true,
  },
  dark: { label: 'Siniestro', color: 'var(--type-dark)', icon: '/assets/types/dark.svg' },
  fairy: {
    label: 'Hada',
    color: 'var(--type-fairy)',
    icon: '/assets/types/fairy.svg',
    darkText: true,
  },
}
