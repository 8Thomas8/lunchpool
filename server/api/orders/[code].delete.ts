export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code') as string
  const removed = await deleteOrderPool(code)

  if (!removed) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found or expired' })
  }

  return { ok: true }
})
