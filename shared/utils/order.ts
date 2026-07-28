export const ORDER_TTL_SECONDS = 6 * 60 * 60

export const ORDER_TTL_MS = ORDER_TTL_SECONDS * 1000

export const ORDER_CATEGORIES = ['pizza', 'salade', 'sandwich', 'plat', 'boisson', 'dessert', 'autre'] as const

export type OrderCategory = typeof ORDER_CATEGORIES[number]

export const DEFAULT_ORDER_CATEGORY: OrderCategory = 'autre'

export interface OrderDraft {
  person: string
  dish: string
  note: string
  cat: OrderCategory
}

export interface OrderEntry extends OrderDraft {
  id: string
  createdAt: number
}

export interface OrderPool {
  code: string
  createdAt: number
  expiresAt: number
  entries: OrderEntry[]
}
