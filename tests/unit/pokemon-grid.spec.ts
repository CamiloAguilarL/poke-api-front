import {
  getPokemonGridColumnCount,
  POKEMON_GRID_MAX_COLUMNS,
} from '@/composables/usePokemonGridColumns'

describe('Pokémon responsive grid', () => {
  it.each([
    [328, 1],
    [736, 2],
    [872, 3],
    [1_288, 4],
    [1_536, 5],
  ])('uses %i available pixels as %i columns', (width, expected) => {
    expect(getPokemonGridColumnCount(width)).toBe(expected)
  })

  it('never expands past the catalog column cap', () => {
    expect(getPokemonGridColumnCount(10_000)).toBe(POKEMON_GRID_MAX_COLUMNS)
  })
})
