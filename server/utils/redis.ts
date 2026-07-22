import { Redis } from '@upstash/redis'

// Upstash Redis client (HTTP, compatible with Vercel serverless).
// Redis.fromEnv() automatically reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.
export const redis = Redis.fromEnv()

// Lifetime of a shared order: 6 hours. The key expires on its own in Redis.
// Usage: redis.set(key, value, { ex: ORDER_TTL_SECONDS })
export const ORDER_TTL_SECONDS = 6 * 60 * 60 // 21600
