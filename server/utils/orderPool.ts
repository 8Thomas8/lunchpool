import { z } from 'zod'
import { ORDER_CODE_ALPHABET, ORDER_CODE_LENGTH } from '../constants/orderCode'
import { redis } from './redis'

export const orderDraftSchema = z.object({
  person: z.string().trim().min(1).max(60),
  dish: z.string().trim().min(1).max(120),
  note: z.string().trim().max(200).default(''),
  cat: z.enum(ORDER_CATEGORIES).default(DEFAULT_ORDER_CATEGORY)
})

const poolKey = (code: string) => `pool:${code}`

const createOrderEntry = (draft: OrderDraft): OrderEntry => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  ...draft
})

export const generateOrderCode = () => Array.from(
  crypto.getRandomValues(new Uint8Array(ORDER_CODE_LENGTH)),
  byte => ORDER_CODE_ALPHABET[byte & 31]
).join('')

export const persistOrderPool = async (pool: OrderPool) => {
  await redis.set(poolKey(pool.code), pool, { exat: Math.ceil(pool.expiresAt / 1000) })
}

export const createOrderPool = async () => {
  const createdAt = Date.now()
  const pool: OrderPool = {
    code: generateOrderCode(),
    createdAt,
    expiresAt: createdAt + ORDER_TTL_MS,
    entries: []
  }

  await persistOrderPool(pool)

  return pool
}

export const deleteOrderPool = async (code: string) => await redis.del(poolKey(code))

export const requireOrderPool = async (code: string) => {
  const pool = await redis.get<OrderPool>(poolKey(code))

  if (!pool) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found or expired' })
  }

  return pool
}

export const addOrderEntry = async (pool: OrderPool, draft: OrderDraft) => {
  pool.entries.push(createOrderEntry(draft))
  await persistOrderPool(pool)

  return pool
}

export const removeOrderEntry = async (pool: OrderPool, id: string) => {
  const remaining = pool.entries.filter(entry => entry.id !== id)

  if (remaining.length === pool.entries.length) {
    throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  }

  pool.entries = remaining
  await persistOrderPool(pool)

  return pool
}
