import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PokemonTypeName } from '@/features/pokemon/domain/models'
import { TYPE_META } from '@/features/pokemon/domain/type-meta'

const styles = readFileSync(resolve(process.cwd(), 'src/styles/main.css'), 'utf8')

const FIGMA_BADGE_TOKENS: Record<
  PokemonTypeName,
  { background: string; contentTone: 'primary' | 'inverse' }
> = {
  normal: { background: '#546e7a', contentTone: 'inverse' },
  fighting: { background: '#e53935', contentTone: 'inverse' },
  flying: { background: '#00bcd4', contentTone: 'inverse' },
  poison: { background: '#9c27b0', contentTone: 'inverse' },
  ground: { background: '#ffb300', contentTone: 'primary' },
  rock: { background: '#795548', contentTone: 'inverse' },
  bug: { background: '#43a047', contentTone: 'inverse' },
  ghost: { background: '#8e24aa', contentTone: 'inverse' },
  steel: { background: '#546e7a', contentTone: 'inverse' },
  fire: { background: '#ff9800', contentTone: 'inverse' },
  water: { background: '#2196f3', contentTone: 'inverse' },
  grass: { background: '#8bc34a', contentTone: 'inverse' },
  electric: { background: '#fdd835', contentTone: 'primary' },
  psychic: { background: '#673ab7', contentTone: 'inverse' },
  ice: { background: '#3d8bff', contentTone: 'inverse' },
  dragon: { background: '#00acc1', contentTone: 'inverse' },
  dark: { background: '#546e7a', contentTone: 'inverse' },
  fairy: { background: '#e91e63', contentTone: 'inverse' },
}

function cssColor(token: string) {
  const name = token.match(/var\((--[^)]+)\)/)?.[1]
  if (!name) throw new Error(`Invalid color token: ${token}`)

  const value = styles.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1]
  if (!value) throw new Error(`Missing color value for ${name}`)
  return value.toLowerCase()
}

describe('Pokémon type badge tokens', () => {
  it.each(Object.entries(FIGMA_BADGE_TOKENS))('%s matches its Figma variant', (type, expected) => {
    const meta = TYPE_META[type as PokemonTypeName]

    expect(cssColor(meta.color)).toBe(expected.background)
    expect(meta.contentTone).toBe(expected.contentTone)
  })
})
