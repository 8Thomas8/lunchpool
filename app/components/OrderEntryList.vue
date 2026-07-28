<script setup lang="ts">
const props = defineProps<{
  entries: OrderEntry[]
}>()

defineEmits<{
  remove: [id: string]
}>()

const { t } = useI18n()

const people = computed(() => new Set(props.entries.map(entry => entry.person)).size)
</script>

<template>
  <section class="rounded-lg border border-default bg-(--lp-card) p-5 shadow-(--lp-shadow)">
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

    <ul
      v-else
      class="flex flex-col gap-2"
    >
      <li
        v-for="entry in entries"
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
          :aria-label="t('orders.remove')"
          @click="$emit('remove', entry.id)"
        >
          {{ t('orders.remove') }}
        </UButton>
      </li>
    </ul>

    <slot />
  </section>
</template>
