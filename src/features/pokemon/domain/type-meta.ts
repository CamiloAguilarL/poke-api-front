import type { PokemonTypeName } from './models'

export interface PokemonTypeMeta {
  label: string
  color: string
  icon: string
  contentTone: 'primary' | 'inverse'
}

export const TYPE_META: Record<PokemonTypeName, PokemonTypeMeta> = {
  normal: {
    label: 'Normal',
    color: 'var(--type-normal)',
    icon: '/assets/types/normal.svg',
    contentTone: 'inverse',
  },
  fighting: {
    label: 'Lucha',
    color: 'var(--type-fighting)',
    icon: '/assets/types/fighting.svg',
    contentTone: 'inverse',
  },
  flying: {
    label: 'Volador',
    color: 'var(--type-flying)',
    icon: '/assets/types/flying.svg',
    contentTone: 'inverse',
  },
  poison: {
    label: 'Veneno',
    color: 'var(--type-poison)',
    icon: '/assets/types/poison.svg',
    contentTone: 'inverse',
  },
  ground: {
    label: 'Tierra',
    color: 'var(--type-ground)',
    icon: '/assets/types/ground.svg',
    contentTone: 'primary',
  },
  rock: {
    label: 'Roca',
    color: 'var(--type-rock)',
    icon: '/assets/types/rock.svg',
    contentTone: 'inverse',
  },
  bug: {
    label: 'Bicho',
    color: 'var(--type-bug)',
    icon: '/assets/types/bug.svg',
    contentTone: 'inverse',
  },
  ghost: {
    label: 'Fantasma',
    color: 'var(--type-ghost)',
    icon: '/assets/types/ghost.svg',
    contentTone: 'inverse',
  },
  steel: {
    label: 'Acero',
    color: 'var(--type-steel)',
    icon: '/assets/types/steel.svg',
    contentTone: 'inverse',
  },
  fire: {
    label: 'Fuego',
    color: 'var(--type-fire)',
    icon: '/assets/types/fire.svg',
    contentTone: 'inverse',
  },
  water: {
    label: 'Agua',
    color: 'var(--type-water)',
    icon: '/assets/types/water.svg',
    contentTone: 'inverse',
  },
  grass: {
    label: 'Planta',
    color: 'var(--type-grass)',
    icon: '/assets/types/grass.svg',
    contentTone: 'inverse',
  },
  electric: {
    label: 'Eléctrico',
    color: 'var(--type-electric)',
    icon: '/assets/types/electric.svg',
    contentTone: 'primary',
  },
  psychic: {
    label: 'Psíquico',
    color: 'var(--type-psychic)',
    icon: '/assets/types/psychic.svg',
    contentTone: 'inverse',
  },
  ice: {
    label: 'Hielo',
    color: 'var(--type-ice)',
    icon: '/assets/types/ice.svg',
    contentTone: 'inverse',
  },
  dragon: {
    label: 'Dragón',
    color: 'var(--type-dragon)',
    icon: '/assets/types/dragon.svg',
    contentTone: 'inverse',
  },
  dark: {
    label: 'Siniestro',
    color: 'var(--type-dark)',
    icon: '/assets/types/dark.svg',
    contentTone: 'inverse',
  },
  fairy: {
    label: 'Hada',
    color: 'var(--type-fairy)',
    icon: '/assets/types/fairy.svg',
    contentTone: 'inverse',
  },
}
