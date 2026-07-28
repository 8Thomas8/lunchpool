import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ORDER_TTL_MS } from '../shared/utils/order'
import {
  addOrderEntry,
  createOrderPool,
  generateOrderCode,
  orderDraftSchema,
  removeOrderEntry,
  requireOrderPool
} from '../server/utils/orderPool'
import { redis } from '../server/utils/redis'

const pipeline = {
  get: vi.fn(),
  hgetall: vi.fn(),
  hset: vi.fn(),
  expireat: vi.fn(),
  exec: vi.fn()
}

vi.mock('../server/utils/redis', () => ({
  redis: {
    set: vi.fn(),
    del: vi.fn(),
    hdel: vi.fn(),
    pipeline: vi.fn()
  }
}))

const setMock = vi.mocked(redis.set)
const hdelMock = vi.mocked(redis.hdel)

const createdAt = Date.parse('2026-07-28T12:00:00Z')
const expiresAt = createdAt + ORDER_TTL_MS
const deadline = Math.ceil(expiresAt / 1000)

const poolWith = (entries: OrderEntry[] = []) => ({ code: 'abcdef', createdAt, expiresAt, entries })

const entry = (id: string, at = createdAt): OrderEntry => ({
  id,
  createdAt: at,
  person: 'Léa',
  dish: 'Tiramisu',
  note: '',
  cat: 'dessert'
})

beforeEach(() => {
  vi.clearAllMocks()
  Object.values(pipeline).forEach(step => step.mockReturnValue(pipeline))
  vi.mocked(redis.pipeline).mockReturnValue(pipeline as never)
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
    vi.useFakeTimers().setSystemTime(createdAt)

    const pool = await createOrderPool()

    expect(pool).toMatchObject({ createdAt, expiresAt, entries: [] })
    expect(setMock).toHaveBeenCalledWith(`pool:${pool.code}`, {
      code: pool.code,
      createdAt,
      expiresAt
    }, { exat: deadline })
  })
})

describe('requireOrderPool', () => {
  it('merges the stored entries in creation order', async () => {
    pipeline.exec.mockResolvedValue([
      { code: 'abcdef', createdAt, expiresAt },
      { second: entry('second', createdAt + 10), first: entry('first', createdAt) }
    ])

    const pool = await requireOrderPool('abcdef')

    expect(pipeline.get).toHaveBeenCalledWith('pool:abcdef')
    expect(pipeline.hgetall).toHaveBeenCalledWith('pool:abcdef:entries')
    expect(pool.entries.map(item => item.id)).toEqual(['first', 'second'])
  })

  it('raises a 404 once the key has expired', async () => {
    pipeline.exec.mockResolvedValue([null, null])

    await expect(requireOrderPool('abcdef')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('addOrderEntry', () => {
  it('writes a single field instead of rewriting the pool', async () => {
    vi.useFakeTimers().setSystemTime(createdAt)
    pipeline.exec.mockResolvedValue([1, 1])

    const pool = await addOrderEntry(poolWith(), { person: 'Léa', dish: 'Tiramisu', note: '', cat: 'dessert' })
    const [added] = pool.entries

    expect(added).toMatchObject({ person: 'Léa', dish: 'Tiramisu', note: '', cat: 'dessert', createdAt })
    expect(added?.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(pipeline.hset).toHaveBeenCalledWith('pool:abcdef:entries', { [added!.id]: added })
    expect(setMock).not.toHaveBeenCalled()
  })

  it('keeps the deadline anchored to the creation of the pool', async () => {
    vi.useFakeTimers().setSystemTime(createdAt + 3 * 60 * 60 * 1000)
    pipeline.exec.mockResolvedValue([1, 1])

    await addOrderEntry(poolWith(), { person: 'Léa', dish: 'Tiramisu', note: '', cat: 'dessert' })

    expect(pipeline.expireat).toHaveBeenCalledWith('pool:abcdef:entries', deadline)
  })
})

describe('removeOrderEntry', () => {
  it('drops the entry from its own field', async () => {
    hdelMock.mockResolvedValue(1)

    const pool = await removeOrderEntry(poolWith([entry('keep'), entry('drop')]), 'drop')

    expect(hdelMock).toHaveBeenCalledWith('pool:abcdef:entries', 'drop')
    expect(pool.entries.map(item => item.id)).toEqual(['keep'])
  })

  it('raises a 404 on an unknown entry', async () => {
    hdelMock.mockResolvedValue(0)

    await expect(removeOrderEntry(poolWith([entry('keep')]), 'ghost')).rejects.toMatchObject({ statusCode: 404 })
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
