import { redis } from '../utils/redis'
import { ORDER_TTL_SECONDS } from '#shared/utils/order'

// Smoke-test route: writes a key with a TTL then reads it back, to prove that
// Redis + the 6-hour expiration work end to end. Not business logic.
export default defineEventHandler(async () => {
  const key = 'health:ping'
  await redis.set(key, Date.now(), { ex: ORDER_TTL_SECONDS })
  const value = await redis.get(key)
  const ttl = await redis.ttl(key)
  return { ok: true, value, ttl }
})
