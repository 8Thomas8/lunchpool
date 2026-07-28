export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code') as string

  return await requireOrderPool(code)
})
