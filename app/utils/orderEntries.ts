export interface OrderDishGroup {
  dish: string
  cat: OrderCategory
  entries: OrderEntry[]
}

export interface OrderCategoryGroup {
  cat: OrderCategory
  count: number
  dishes: OrderDishGroup[]
}

export const groupOrderEntries = (entries: OrderEntry[]): OrderCategoryGroup[] => {
  const dishes = new Map<string, OrderDishGroup>()

  for (const entry of entries) {
    const key = entry.dish.trim().toLowerCase()
    const dish = dishes.get(key)

    if (dish) {
      dish.entries.push(entry)
    } else {
      dishes.set(key, { dish: entry.dish, cat: entry.cat, entries: [entry] })
    }
  }

  const byCategory = new Map<OrderCategory, OrderDishGroup[]>()

  for (const dish of [...dishes.values()].sort((a, b) => b.entries.length - a.entries.length)) {
    const catDishes = byCategory.get(dish.cat)

    if (catDishes) {
      catDishes.push(dish)
    } else {
      byCategory.set(dish.cat, [dish])
    }
  }

  return ORDER_CATEGORIES.flatMap((cat) => {
    const catDishes = byCategory.get(cat)

    if (!catDishes) return []

    return [{
      cat,
      count: catDishes.reduce((total, dish) => total + dish.entries.length, 0),
      dishes: catDishes
    }]
  })
}

export const orderPersonInitials = (person: string) => person.trim().slice(0, 2).toUpperCase()

export const orderPersonHue = (person: string) => {
  let hue = 0

  for (let index = 0; index < person.length; index++) {
    hue = (hue * 31 + person.charCodeAt(index)) % 360
  }

  return hue
}
