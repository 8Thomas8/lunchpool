import { z } from 'zod'
import { ORDER_CODE_ALPHABET, ORDER_CODE_LENGTH } from '../constants/orderCode'
import { redis } from './redis'

export const orderDraftSchema = z.object({
  person: z.string().trim().min(1).max(60),
  dish: z.string().trim().min(1).max(120),
  note: z.string().trim().max(200).default(''),
  cat: z.enum(ORDER_CATEGORIES).default(DEFAULT_ORDER_CATEGORY),
  price: z.number().min(0).max(ORDER_MAX_PRICE).default(0).transform(price => Math.round(price * 100) / 100)
})

export const orderSettingsSchema = z.object({
  priceEnabled: z.boolean()
}).partial()

type OrderPoolMeta = Omit<OrderPool, 'entries'>

const poolKey = (code: string) => `pool:${code}`

const entriesKey = (code: string) => `pool:${code}:entries`

const deadline = (pool: OrderPoolMeta) => Math.ceil(pool.expiresAt / 1000)

const byCreation = (a: OrderEntry, b: OrderEntry) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)

const createOrderEntry = (draft: OrderDraft): OrderEntry => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  ...draft
})

export const generateOrderCode = () => Array.from(
  crypto.getRandomValues(new Uint8Array(ORDER_CODE_LENGTH)),
  byte => ORDER_CODE_ALPHABET[byte & 31]
).join('')

export const createOrderPool = async () => {
  const createdAt = Date.now()
  const meta: OrderPoolMeta = {
    ...DEFAULT_ORDER_SETTINGS,
    code: generateOrderCode(),
    createdAt,
    expiresAt: createdAt + ORDER_TTL_MS
  }

  await redis.set(poolKey(meta.code), meta, { exat: deadline(meta) })

  const pool: OrderPool = { ...meta, entries: [] }

  return pool
}

export const deleteOrderPool = async (code: string) => await redis.del(poolKey(code), entriesKey(code))

export const requireOrderPool = async (code: string): Promise<OrderPool> => {
  const [meta, entries] = await redis.pipeline()
    .get<OrderPoolMeta>(poolKey(code))
    .hgetall<Record<string, OrderEntry>>(entriesKey(code))
    .exec<[OrderPoolMeta | null, Record<string, OrderEntry> | null]>()

  if (!meta) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found or expired' })
  }

  return {
    ...DEFAULT_ORDER_SETTINGS,
    ...meta,
    entries: Object.values(entries ?? {}).sort(byCreation)
  }
}

export const updateOrderSettings = async (pool: OrderPool, settings: Partial<OrderSettings>) => {
  const { entries, ...meta } = pool

  await redis.set(poolKey(pool.code), { ...meta, ...settings }, { exat: deadline(pool) })

  return { ...pool, ...settings }
}

export const addOrderEntry = async (pool: OrderPool, draft: OrderDraft) => {
  const entry = createOrderEntry(draft)

  await redis.pipeline()
    .hset(entriesKey(pool.code), { [entry.id]: entry })
    .expireat(entriesKey(pool.code), deadline(pool))
    .exec()

  return { ...pool, entries: [...pool.entries, entry].sort(byCreation) }
}

export const removeOrderEntry = async (pool: OrderPool, id: string) => {
  const removed = await redis.hdel(entriesKey(pool.code), id)

  if (!removed) {
    throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  }

  return { ...pool, entries: pool.entries.filter(entry => entry.id !== id) }
}
