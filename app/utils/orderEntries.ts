export interface OrderDishGroup {
  key: string
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
      dishes.set(key, { key, dish: entry.dish, cat: entry.cat, entries: [entry] })
    }
  }

  const byCount = [...dishes.values()].sort((a, b) => b.entries.length - a.entries.length)

  return ORDER_CATEGORIES
    .map((cat) => {
      const catDishes = byCount.filter(dish => dish.cat === cat)

      return {
        cat,
        count: catDishes.reduce((total, dish) => total + dish.entries.length, 0),
        dishes: catDishes
      }
    })
    .filter(group => group.dishes.length > 0)
}

export const orderPersonInitials = (person: string) => person.trim().slice(0, 2).toUpperCase()

export const orderPersonHue = (person: string) => {
  let hue = 0

  for (let index = 0; index < person.length; index++) {
    hue = (hue * 31 + person.charCodeAt(index)) % 360
  }

  return hue
}
