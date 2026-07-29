export const useOrderPool = (code: string) => {
  const { data: pool, status, error, refresh } = useFetch<OrderPool>(`/api/orders/${code}`)

  const actionFailed = ref(false)

  const mutate = async (request: () => Promise<OrderPool>) => {
    actionFailed.value = false

    try {
      pool.value = await request()
    } catch {
      actionFailed.value = true
      await refresh()
    }
  }

  const addEntry = (draft: OrderDraft) => mutate(
    () => $fetch(`/api/orders/${code}/entries`, { method: 'POST', body: draft })
  )

  const removeEntry = (id: string) => mutate(
    () => $fetch(`/api/orders/${code}/entries/${id}`, { method: 'DELETE' })
  )

  const setPriceEnabled = (priceEnabled: boolean) => mutate(
    () => $fetch(`/api/orders/${code}`, { method: 'PATCH', body: { priceEnabled } })
  )

  return { pool, status, error, actionFailed, addEntry, removeEntry, setPriceEnabled, refresh }
}
