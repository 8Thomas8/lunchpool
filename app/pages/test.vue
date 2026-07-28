<script setup lang="ts">
useHead({
  title: 'LunchPool — vue de test',
  meta: [{ name: 'robots', content: 'noindex' }]
})

const code = useLocalStorage('lunchpool-test-code', '', { initOnMounted: true })
const pool = ref<OrderPool | null>(null)
const error = ref('')
const pending = ref(false)

const run = async (task: () => Promise<void>) => {
  pending.value = true
  error.value = ''

  try {
    await task()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }

  pending.value = false
}

const refresh = async () => {
  pool.value = await $fetch(`/api/orders/${code.value}`)
}

const createPool = () => run(async () => {
  const created = await $fetch('/api/orders', { method: 'POST' })
  code.value = created.code
  pool.value = created
})

const loadPool = () => run(async () => {
  pool.value = null
  await refresh()
})

const addEntry = (draft: OrderDraft) => run(async () => {
  pool.value = await $fetch(`/api/orders/${code.value}/entries`, { method: 'POST', body: draft })
})

const removeEntry = (id: string) => run(async () => {
  pool.value = await $fetch(`/api/orders/${code.value}/entries/${id}`, { method: 'DELETE' })
})

const removePool = () => run(async () => {
  await $fetch(`/api/orders/${code.value}`, { method: 'DELETE' })
  pool.value = null
})

const expiresIn = computed(() => {
  if (!pool.value) return ''

  const minutes = Math.round((pool.value.expiresAt - Date.now()) / 60000)

  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`
})
</script>

<template>
  <div class="contents">
    <section class="rounded-2xl border border-default bg-(--lp-card) p-5 shadow-(--lp-shadow)">
      <h1 class="text-[15px] font-bold text-highlighted">
        Vue de test — stockage des commandes
      </h1>
      <p class="mt-1 text-sm text-muted">
        Crée une commande, ajoute des plats, supprime-les, puis supprime la commande. Les données vivent 6 h dans Redis.
      </p>

      <div class="mt-4 flex flex-wrap items-end gap-3">
        <div class="flex-[1_1_200px]">
          <label
            for="test-code"
            class="mb-1.5 block text-[13px] font-medium text-muted"
          >
            Code de commande
          </label>
          <input
            id="test-code"
            v-model="code"
            type="text"
            placeholder="a1b2c3"
            class="w-full rounded-lg border border-default bg-(--lp-input) px-3 py-2.5 font-mono text-sm text-highlighted outline-none focus:border-primary focus:ring-[3px] focus:ring-(--lp-ring)"
          >
        </div>

        <UButton
          :loading="pending"
          @click="createPool"
        >
          Créer
        </UButton>
        <UButton
          color="neutral"
          variant="subtle"
          :disabled="pending || !code"
          @click="loadPool"
        >
          Charger
        </UButton>
        <UButton
          color="error"
          variant="subtle"
          :disabled="pending || !pool"
          @click="removePool"
        >
          Supprimer la commande
        </UButton>
      </div>

      <p
        v-if="error"
        class="mt-3 rounded-lg bg-error/10 px-3 py-2 text-sm text-error"
      >
        {{ error }}
      </p>
    </section>

    <template v-if="pool">
      <section class="rounded-2xl border border-default bg-(--lp-card) p-5 shadow-(--lp-shadow)">
        <h2 class="text-[15px] font-bold text-highlighted">
          Commande {{ pool.code }}
        </h2>
        <p class="mt-1 text-sm text-muted">
          Créée le {{ new Date(pool.createdAt).toLocaleString('fr-FR') }} · expire dans {{ expiresIn }} · {{ pool.entries.length }} entrée(s)
        </p>

        <ul class="mt-4 flex flex-col gap-2">
          <li
            v-for="entry in pool.entries"
            :key="entry.id"
            class="flex items-center gap-3 rounded-lg bg-elevated px-3 py-2 text-sm"
          >
            <span
              class="size-2.5 shrink-0 rounded-full"
              :style="{ backgroundColor: ORDER_CATEGORY_COLORS[entry.cat] }"
            />
            <span class="font-semibold text-highlighted">{{ entry.person }}</span>
            <span class="min-w-0 flex-1 truncate text-muted">
              {{ entry.dish }}<template v-if="entry.note"> · {{ entry.note }}</template>
            </span>
            <UButton
              color="error"
              variant="ghost"
              size="xs"
              :disabled="pending"
              @click="removeEntry(entry.id)"
            >
              Supprimer
            </UButton>
          </li>
        </ul>

        <pre class="mt-4 overflow-x-auto rounded-lg bg-elevated p-3 font-mono text-xs text-muted">{{ pool }}</pre>
      </section>

      <OrderAddForm @submit="addEntry" />
    </template>
  </div>
</template>
