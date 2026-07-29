<script setup lang="ts">
const props = defineProps<{
  entries: OrderEntry[]
  priceEnabled: boolean
}>()

defineEmits<{
  remove: [id: string]
}>()

const { t, locale } = useI18n()

const people = computed(() => new Set(props.entries.map(entry => entry.person)).size)

const groups = computed(() => groupOrderEntries(props.entries))
</script>

<template>
  <section>
    <div class="mb-3.5 flex items-baseline gap-2">
      <h2 class="text-base font-extrabold tracking-[-0.01em] text-highlighted">
        {{ t('orders.title') }}
      </h2>
      <span class="text-[13px] text-muted">{{ t('orders.people', people) }}</span>
    </div>

    <p
      v-if="!entries.length"
      class="rounded-lg border border-dashed border-default p-9 text-center text-sm text-muted"
    >
      {{ t('orders.empty') }}
    </p>

    <div
      v-else
      class="flex flex-col gap-[22px]"
    >
      <div
        v-for="group in groups"
        :key="group.cat"
        :style="{ '--lp-cat': ORDER_CATEGORY_COLORS[group.cat] }"
      >
        <div class="mb-2.5 flex items-center gap-2.5">
          <OrderCategoryChip
            :cat="group.cat"
            active
          />
          <span class="text-[13px] font-semibold text-muted">{{ t('orders.items', group.count) }}</span>
        </div>

        <ul class="flex flex-col gap-3">
          <li
            v-for="dish in group.dishes"
            :key="dish.dish"
            class="rounded-lg border border-default bg-(--lp-card) px-[18px] py-4 shadow-(--lp-shadow) transition-colors hover:border-primary"
          >
            <div class="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                class="size-2 shrink-0 rounded-full bg-(--lp-cat)"
              />
              <p class="min-w-0 flex-1 text-[15px] font-semibold text-highlighted">
                {{ dish.dish }}
              </p>
              <span class="inline-flex h-[30px] min-w-[34px] shrink-0 items-center justify-center rounded-md bg-(--lp-primary-soft) px-2 text-[13px] font-bold tabular-nums text-primary">
                <span aria-hidden="true">×{{ dish.entries.length }}</span>
                <span class="sr-only">{{ t('orders.items', dish.entries.length) }}</span>
              </span>
            </div>

            <ul class="mt-3 flex flex-col gap-2">
              <li
                v-for="entry in dish.entries"
                :key="entry.id"
                class="flex items-center gap-2.5 rounded-lg bg-elevated px-3 py-2"
              >
                <OrderPersonAvatar :person="entry.person" />

                <p class="min-w-0 flex-1 truncate text-sm">
                  <span class="font-semibold text-highlighted">{{ entry.person }}</span>
                  <span
                    v-if="entry.note"
                    class="text-[13px] text-muted"
                  > · {{ entry.note }}</span>
                </p>

                <span
                  v-if="priceEnabled && entry.price"
                  class="shrink-0 rounded-md border border-default bg-(--lp-card) px-2 py-0.5 text-xs font-semibold tabular-nums whitespace-nowrap text-muted"
                >
                  {{ formatOrderPrice(entry.price, locale) }}
                </span>

                <button
                  type="button"
                  :aria-label="t('orders.removeEntry', { person: entry.person, dish: dish.dish })"
                  class="shrink-0 cursor-pointer rounded-md p-1 text-muted transition-colors hover:bg-error/10 hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary print:hidden"
                  @click="$emit('remove', entry.id)"
                >
                  <UIcon
                    name="i-lucide-x"
                    class="size-4"
                  />
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <slot />
  </section>
</template>
