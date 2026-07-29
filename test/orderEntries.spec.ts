import { describe, expect, it } from 'vitest'
import { groupOrderEntries, orderPersonHue, orderPersonInitials } from '../app/utils/orderEntries'
import type { OrderCategory, OrderEntry } from '../shared/utils/order'

let sequence = 0

const entry = (person: string, dish: string, cat: OrderCategory): OrderEntry => {
  sequence++

  return { id: `id-${sequence}`, person, dish, note: '', cat, price: 0, createdAt: sequence }
}

describe('groupOrderEntries', () => {
  it('groups entries by dish, then by category', () => {
    const groups = groupOrderEntries([
      entry('Léa', 'Pizza Margherita', 'pizza'),
      entry('Yuki', 'Salade César', 'salade'),
      entry('Marco', 'Pizza Margherita', 'pizza')
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0]).toMatchObject({ cat: 'pizza', count: 2 })
    expect(groups[0]?.dishes[0]?.entries.map(item => item.person)).toEqual(['Léa', 'Marco'])
    expect(groups[1]).toMatchObject({ cat: 'salade', count: 1 })
  })

  it('treats case and surrounding spaces as the same dish', () => {
    const groups = groupOrderEntries([
      entry('Léa', 'Tiramisu', 'dessert'),
      entry('Sam', ' tiramisu ', 'dessert')
    ])

    expect(groups[0]?.dishes).toHaveLength(1)
    expect(groups[0]?.dishes[0]?.dish).toBe('Tiramisu')
  })

  it('keeps the category of the first entry of a dish', () => {
    const groups = groupOrderEntries([
      entry('Léa', 'Focaccia', 'plat'),
      entry('Sam', 'Focaccia', 'sandwich')
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0]).toMatchObject({ cat: 'plat', count: 2 })
  })

  it('orders categories as declared and dishes by decreasing quantity', () => {
    const groups = groupOrderEntries([
      entry('Léa', 'Limonade', 'boisson'),
      entry('Yuki', 'Tiramisu', 'dessert'),
      entry('Sam', 'Pizza Regina', 'pizza'),
      entry('Marco', 'Pizza Margherita', 'pizza'),
      entry('Léa', 'Pizza Margherita', 'pizza')
    ])

    expect(groups.map(group => group.cat)).toEqual(['pizza', 'boisson', 'dessert'])
    expect(groups[0]?.dishes.map(dish => dish.dish)).toEqual(['Pizza Margherita', 'Pizza Regina'])
  })

  it('returns no group for an empty order', () => {
    expect(groupOrderEntries([])).toEqual([])
  })
})

describe('orderPersonInitials', () => {
  it('takes the first two characters in upper case', () => {
    expect(orderPersonInitials(' camille ')).toBe('CA')
    expect(orderPersonInitials('Léa')).toBe('LÉ')
    expect(orderPersonInitials('S')).toBe('S')
  })
})

describe('orderPersonHue', () => {
  it('derives a stable hue within the colour wheel', () => {
    expect(orderPersonHue('Camille')).toBe(orderPersonHue('Camille'))
    expect(orderPersonHue('Camille')).not.toBe(orderPersonHue('Marco'))

    for (const person of ['Léa', 'Marco', 'Yuki', 'Sam', '']) {
      const hue = orderPersonHue(person)

      expect(Number.isInteger(hue)).toBe(true)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    }
  })
})
