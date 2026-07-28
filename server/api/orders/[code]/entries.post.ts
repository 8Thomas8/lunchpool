export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code') as string
  const draft = await readValidatedBody(event, orderDraftSchema.parse)
  const pool = await requireOrderPool(code)

  setResponseStatus(event, 201)

  return await addOrderEntry(pool, draft)
})
