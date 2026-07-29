export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code') as string
  const { priceEnabled } = await readValidatedBody(event, orderSettingsSchema.parse)
  const pool = await requireOrderPool(code)

  return await setOrderPriceEnabled(pool, priceEnabled)
})
