import {
  DEFAULT_ORDER_CATEGORY,
  DEFAULT_ORDER_SETTINGS,
  ORDER_CATEGORIES,
  ORDER_MAX_PRICE,
  ORDER_TTL_MS
} from '../shared/utils/order'

const createError = (input: { statusCode: number, statusMessage: string }) =>
  Object.assign(new Error(input.statusMessage), input)

Object.assign(globalThis, {
  createError,
  DEFAULT_ORDER_CATEGORY,
  DEFAULT_ORDER_SETTINGS,
  ORDER_CATEGORIES,
  ORDER_MAX_PRICE,
  ORDER_TTL_MS
})
