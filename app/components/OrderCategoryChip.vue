<script setup lang="ts">
withDefaults(defineProps<{
  cat: OrderCategory
  active?: boolean
  as?: string
}>(), {
  active: false,
  as: 'span'
})

const { t } = useI18n()
</script>

<template>
  <component
    :is="as"
    :style="{ '--lp-cat': ORDER_CATEGORY_COLORS[cat] }"
    class="rounded-full border px-[13px] py-1.5 text-xs font-bold"
    :class="active
      ? 'border-(--lp-cat) bg-[color-mix(in_srgb,var(--lp-cat)_12%,transparent)] text-(--lp-cat) dark:bg-[color-mix(in_srgb,var(--lp-cat)_18%,transparent)]'
      : 'border-default text-muted'"
  >
    <slot />
    {{ t(`categories.${cat}`) }}
  </component>
</template>
