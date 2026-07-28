export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code') as string
  const id = getRouterParam(event, 'id') as string
  const pool = await requireOrderPool(code)

  return await removeOrderEntry(pool, id)
})
