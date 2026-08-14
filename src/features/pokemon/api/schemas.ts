import { z } from 'zod'

export const namedResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
})

export const pokemonListSchema = z.object({
  count: z.number(),
  results: z.array(namedResourceSchema),
})

const pokemonTypeSlotSchema = z.object({
  slot: z.number(),
  type: namedResourceSchema,
})

const pokemonAbilitySlotSchema = z.object({
  ability: namedResourceSchema,
  is_hidden: z.boolean(),
  slot: z.number(),
})

export const pokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  types: z.array(pokemonTypeSlotSchema),
  abilities: z.array(pokemonAbilitySlotSchema),
  sprites: z.looseObject({
    front_default: z.string().nullable(),
    other: z.unknown().optional(),
    versions: z.unknown().optional(),
  }),
})

const localizedNameSchema = z.object({
  name: z.string(),
  language: namedResourceSchema,
})

export const pokemonSpeciesSchema = z.object({
  name: z.string(),
  gender_rate: z.number(),
  names: z.array(localizedNameSchema),
  flavor_text_entries: z.array(
    z.object({
      flavor_text: z.string(),
      language: namedResourceSchema,
    }),
  ),
  genera: z.array(
    z.object({
      genus: z.string(),
      language: namedResourceSchema,
    }),
  ),
  evolution_chain: z.object({ url: z.string() }),
})

export const abilitySchema = z.object({
  name: z.string(),
  names: z.array(localizedNameSchema),
})

const damageRelationsSchema = z.object({
  double_damage_from: z.array(namedResourceSchema),
  half_damage_from: z.array(namedResourceSchema),
  no_damage_from: z.array(namedResourceSchema),
})

export const typeSchema = z.object({
  name: z.string(),
  names: z.array(localizedNameSchema),
  damage_relations: damageRelationsSchema,
  pokemon: z.array(z.object({ pokemon: namedResourceSchema })),
})

export const evolutionChainSchema = z.object({
  chain: z.unknown(),
})

export type PokemonDto = z.infer<typeof pokemonSchema>
export type PokemonSpeciesDto = z.infer<typeof pokemonSpeciesSchema>
export type PokemonTypeDto = z.infer<typeof typeSchema>
