export const ORDER_TTL_SECONDS = 6 * 60 * 60

export const ORDER_TTL_MS = ORDER_TTL_SECONDS * 1000

export const ORDER_CATEGORIES = ['pizza', 'salade', 'sandwich', 'plat', 'boisson', 'dessert', 'autre'] as const

export type OrderCategory = typeof ORDER_CATEGORIES[number]

export const DEFAULT_ORDER_CATEGORY: OrderCategory = 'autre'

export const ORDER_CURRENCY = '€'

export const ORDER_MAX_PRICE = 9999

export interface OrderDraft {
  person: string
  dish: string
  note: string
  cat: OrderCategory
  price: number
}

export interface OrderEntry extends OrderDraft {
  id: string
  createdAt: number
}

export interface OrderSettings {
  priceEnabled: boolean
}

export const DEFAULT_ORDER_SETTINGS: OrderSettings = {
  priceEnabled: true
}

export interface OrderPool extends OrderSettings {
  code: string
  createdAt: number
  expiresAt: number
  entries: OrderEntry[]
}

export const parseOrderPrice = (value: string) => {
  const price = Number.parseFloat(value.replace(',', '.'))

  if (!Number.isFinite(price) || price <= 0) return 0

  return Math.min(price, ORDER_MAX_PRICE)
}

export const formatOrderPrice = (price: number, locale: string) => {
  const amount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)

  return `${amount}\u00a0${ORDER_CURRENCY}`
}
