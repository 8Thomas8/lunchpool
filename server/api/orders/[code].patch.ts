export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code') as string
  const settings = await readValidatedBody(event, orderSettingsSchema.parse)
  const pool = await requireOrderPool(code)

  return await updateOrderSettings(pool, settings)
})
