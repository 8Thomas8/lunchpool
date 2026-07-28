import { DEFAULT_ORDER_CATEGORY, ORDER_CATEGORIES, ORDER_TTL_MS } from '../shared/utils/order'

const createError = (input: { statusCode: number, statusMessage: string }) =>
  Object.assign(new Error(input.statusMessage), input)

Object.assign(globalThis, { createError, DEFAULT_ORDER_CATEGORY, ORDER_CATEGORIES, ORDER_TTL_MS })
