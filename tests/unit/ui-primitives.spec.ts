import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SearchField } from '@/components/ui/search-field'
import { Toggle } from '@/components/ui/toggle'

describe('design system primitives', () => {
  it('owns the complete search interaction and renders a single clear action', async () => {
    const wrapper = mount(SearchField, {
      props: {
        modelValue: 'bulb',
        label: 'Buscar Pokémon',
        placeholder: 'Buscar Pokémon...',
      },
    })

    const input = wrapper.get('input[type="search"]')
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(wrapper.findAll('button[aria-label="Limpiar búsqueda"]')).toHaveLength(1)

    await input.setValue('pikachu')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['pikachu'])

    await wrapper.get('button[aria-label="Limpiar búsqueda"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })

  it('exposes the accessible pressed state through the toggle primitive', async () => {
    const wrapper = mount(Toggle, {
      props: { modelValue: false },
      slots: { default: 'Fuego' },
    })

    const toggle = wrapper.get('button')
    expect(toggle.attributes('aria-pressed')).toBe('false')
    await toggle.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })
})
