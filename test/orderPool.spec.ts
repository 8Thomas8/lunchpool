import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ORDER_TTL_MS } from '../shared/utils/order'
import {
  addOrderEntry,
  createOrderPool,
  generateOrderCode,
  orderDraftSchema,
  persistOrderPool,
  removeOrderEntry,
  requireOrderPool
} from '../server/utils/orderPool'
import { redis } from '../server/utils/redis'

vi.mock('../server/utils/redis', () => ({
  redis: { set: vi.fn(), get: vi.fn(), del: vi.fn() }
}))

const setMock = vi.mocked(redis.set)
const getMock = vi.mocked(redis.get)

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('generateOrderCode', () => {
  it('draws six unambiguous characters without repeating itself', () => {
    const codes = Array.from({ length: 500 }, generateOrderCode)

    expect(codes.every(code => /^[a-km-np-z2-9]{6}$/.test(code))).toBe(true)
    expect(new Set(codes).size).toBe(codes.length)
  })
})

describe('createOrderPool', () => {
  it('expires six hours after its creation', async () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-07-28T12:00:00Z'))

    const pool = await createOrderPool()

    expect(pool.entries).toEqual([])
    expect(pool.expiresAt - pool.createdAt).toBe(ORDER_TTL_MS)
    expect(setMock).toHaveBeenCalledWith(`pool:${pool.code}`, pool, {
      exat: Math.ceil(pool.expiresAt / 1000)
    })
  })
})

describe('persistOrderPool', () => {
  it('keeps the original deadline when the pool is written again', async () => {
    const createdAt = Date.parse('2026-07-28T12:00:00Z')
    const pool = { code: 'abcdef', createdAt, expiresAt: createdAt + ORDER_TTL_MS, entries: [] }

    vi.useFakeTimers().setSystemTime(createdAt + 3 * 60 * 60 * 1000)
    await persistOrderPool(pool)

    expect(setMock).toHaveBeenCalledWith('pool:abcdef', pool, {
      exat: Math.ceil((createdAt + ORDER_TTL_MS) / 1000)
    })
  })
})

describe('requireOrderPool', () => {
  it('returns the stored pool', async () => {
    const pool = { code: 'abcdef', createdAt: 1, expiresAt: 2, entries: [] }
    getMock.mockResolvedValue(pool)

    await expect(requireOrderPool('abcdef')).resolves.toEqual(pool)
  })

  it('raises a 404 once the key has expired', async () => {
    getMock.mockResolvedValue(null)

    await expect(requireOrderPool('abcdef')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('addOrderEntry', () => {
  it('stamps the draft with an id and a creation date, then stores the pool', async () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-07-28T12:00:00Z'))

    const pool = { code: 'abcdef', createdAt: 1, expiresAt: 2, entries: [] }
    const updated = await addOrderEntry(pool, { person: 'Léa', dish: 'Tiramisu', note: '', cat: 'dessert' })
    const [entry] = updated.entries

    expect(entry).toMatchObject({ person: 'Léa', dish: 'Tiramisu', note: '', cat: 'dessert' })
    expect(entry?.createdAt).toBe(Date.parse('2026-07-28T12:00:00Z'))
    expect(entry?.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(setMock).toHaveBeenCalledOnce()
  })
})

describe('removeOrderEntry', () => {
  const poolWith = (ids: string[]) => ({
    code: 'abcdef',
    createdAt: 1,
    expiresAt: 2,
    entries: ids.map(id => ({ id, createdAt: 1, person: 'Léa', dish: 'Tiramisu', note: '', cat: 'dessert' as const }))
  })

  it('drops the entry and stores the pool', async () => {
    const updated = await removeOrderEntry(poolWith(['keep', 'drop']), 'drop')

    expect(updated.entries.map(entry => entry.id)).toEqual(['keep'])
    expect(setMock).toHaveBeenCalledOnce()
  })

  it('raises a 404 on an unknown entry and stores nothing', async () => {
    await expect(removeOrderEntry(poolWith(['keep']), 'ghost')).rejects.toMatchObject({ statusCode: 404 })
    expect(setMock).not.toHaveBeenCalled()
  })
})

describe('orderDraftSchema', () => {
  it('trims the text fields and fills in the optional ones', () => {
    expect(orderDraftSchema.parse({ person: '  Léa  ', dish: '  Pizza  ' })).toEqual({
      person: 'Léa',
      dish: 'Pizza',
      note: '',
      cat: 'autre'
    })
  })

  it('rejects a draft without a person or a dish', () => {
    expect(orderDraftSchema.safeParse({ person: '   ', dish: 'Pizza' }).success).toBe(false)
    expect(orderDraftSchema.safeParse({ person: 'Léa', dish: '' }).success).toBe(false)
  })

  it('rejects an unknown category and oversized text', () => {
    expect(orderDraftSchema.safeParse({ person: 'Léa', dish: 'Pizza', cat: 'sushi' }).success).toBe(false)
    expect(orderDraftSchema.safeParse({ person: 'Léa', dish: 'x'.repeat(121) }).success).toBe(false)
  })
})
