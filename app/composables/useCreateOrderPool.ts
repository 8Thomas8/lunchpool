export const useCreateOrderPool = () => {
  const localePath = useLocalePath()

  const creating = ref(false)
  const failed = ref(false)

  const create = async () => {
    creating.value = true
    failed.value = false

    try {
      const created = await $fetch('/api/orders', { method: 'POST' })

      await navigateTo(localePath(`/o/${created.code}`))
    } catch {
      creating.value = false
      failed.value = true
    }
  }

  return { creating, failed, create }
}
