<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const requestUrl = useRequestURL()

const code = route.params.code as string
const { pool, error, actionFailed, addEntry, removeEntry, setPriceEnabled, refresh } = useOrderPool(code)
const { creating, create } = useCreateOrderPool()

useHead({ meta: [{ name: 'robots', content: 'noindex' }] })

const shareUrl = new URL(localePath(`/o/${code}`), requestUrl.origin).toString()

const expired = computed(() => error.value?.statusCode === 404)
</script>

<template>
  <div class="contents">
    <template v-if="pool">
      <OrderHero
        :share-url="shareUrl"
        :expires-at="pool.expiresAt"
        :price-enabled="pool.priceEnabled"
        @update:price-enabled="setPriceEnabled"
      />

      <OrderAddForm
        :price-enabled="pool.priceEnabled"
        @submit="addEntry"
      />

      <OrderEntryList
        :entries="pool.entries"
        :price-enabled="pool.priceEnabled"
        @remove="removeEntry"
      >
        <p
          v-if="actionFailed"
          class="mt-3 rounded-lg bg-error/10 px-3 py-2 text-sm text-error"
        >
          {{ t('orders.actionFailed') }}
        </p>
      </OrderEntryList>
    </template>

    <section
      v-else-if="error"
      class="rounded-lg border border-default bg-(--lp-card) p-9 text-center shadow-(--lp-shadow)"
    >
      <h1 class="text-[15px] font-bold text-highlighted">
        {{ expired ? t('order.notFound') : t('order.loadFailed') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ expired ? t('order.notFoundHint') : t('order.loadFailedHint') }}
      </p>
      <UButton
        v-if="expired"
        class="mt-4"
        :loading="creating"
        @click="create"
      >
        {{ t('home.create') }}
      </UButton>
      <UButton
        v-else
        class="mt-4"
        color="neutral"
        variant="subtle"
        @click="() => refresh()"
      >
        {{ t('order.retry') }}
      </UButton>
    </section>
  </div>
</template>
