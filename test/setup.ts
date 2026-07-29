import {
  DEFAULT_ORDER_CATEGORY,
  ORDER_CATEGORIES,
  ORDER_MAX_PRICE,
  ORDER_TTL_MS,
  roundOrderPrice
} from '../shared/utils/order'

const createError = (input: { statusCode: number, statusMessage: string }) =>
  Object.assign(new Error(input.statusMessage), input)

Object.assign(globalThis, {
  createError,
  DEFAULT_ORDER_CATEGORY,
  ORDER_CATEGORIES,
  ORDER_MAX_PRICE,
  ORDER_TTL_MS,
  roundOrderPrice
})
