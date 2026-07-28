<script setup lang="ts">
const emit = defineEmits<{
  submit: [draft: OrderDraft]
}>()

const { t } = useI18n()

const nameId = useId()
const dishId = useId()
const noteId = useId()

const form = reactive({
  name: '',
  dish: '',
  note: '',
  cat: DEFAULT_ORDER_CATEGORY as OrderCategory
})

const canSubmit = computed(() => form.name.trim().length > 0 && form.dish.trim().length > 0)

const onSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', {
    person: form.name.trim(),
    dish: form.dish.trim(),
    note: form.note.trim(),
    cat: form.cat
  })

  form.dish = ''
  form.note = ''
  form.cat = DEFAULT_ORDER_CATEGORY
}
</script>

<template>
  <form
    class="rounded-lg border border-default bg-(--lp-card) p-5 shadow-(--lp-shadow) print:hidden"
    @submit.prevent="onSubmit"
  >
    <p class="mb-4 text-[15px] font-bold text-highlighted">
      {{ t('form.title') }}
    </p>

    <div class="flex flex-wrap items-end gap-3.5">
      <div class="flex-[1_1_150px]">
        <label
          :for="nameId"
          class="mb-1.5 block text-[13px] font-medium text-muted"
        >
          {{ t('form.name') }}
        </label>
        <input
          :id="nameId"
          v-model="form.name"
          type="text"
          autocomplete="name"
          :placeholder="t('form.namePlaceholder')"
          class="w-full rounded-lg border border-default bg-(--lp-input) px-3 py-2.5 text-sm text-highlighted outline-none placeholder:text-muted focus:border-primary focus:ring-[3px] focus:ring-(--lp-ring)"
        >
      </div>

      <div class="flex-[1_1_200px]">
        <label
          :for="dishId"
          class="mb-1.5 block text-[13px] font-medium text-muted"
        >
          {{ t('form.dish') }}
        </label>
        <input
          :id="dishId"
          v-model="form.dish"
          type="text"
          :placeholder="t('form.dishPlaceholder')"
          class="w-full rounded-lg border border-default bg-(--lp-input) px-3 py-2.5 text-sm text-highlighted outline-none placeholder:text-muted focus:border-primary focus:ring-[3px] focus:ring-(--lp-ring)"
        >
      </div>

      <div class="flex-[1_1_180px]">
        <label
          :for="noteId"
          class="mb-1.5 block text-[13px] font-medium text-muted"
        >
          {{ t('form.note') }}
        </label>
        <input
          :id="noteId"
          v-model="form.note"
          type="text"
          :placeholder="t('form.notePlaceholder')"
          class="w-full rounded-lg border border-default bg-(--lp-input) px-3 py-2.5 text-sm text-highlighted outline-none placeholder:text-muted focus:border-primary focus:ring-[3px] focus:ring-(--lp-ring)"
        >
      </div>

      <button
        type="submit"
        :disabled="!canSubmit"
        class="h-10 shrink-0 self-end rounded-lg bg-green-700 px-5 py-2.5 text-sm font-bold whitespace-nowrap text-white shadow-[0_6px_16px_-6px_var(--lp-primary-strong)] transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        + {{ t('form.add') }}
      </button>
    </div>

    <fieldset class="mt-4">
      <legend class="mb-2 block text-[13px] font-medium text-muted">
        {{ t('form.category') }}
      </legend>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="category in ORDER_CATEGORIES"
          :key="category"
          :style="{ '--lp-pill': ORDER_CATEGORY_COLORS[category] }"
          class="cursor-pointer rounded-full border px-[13px] py-1.5 text-xs font-bold transition-[color,background-color,border-color] duration-[120ms] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
          :class="form.cat === category
            ? 'border-(--lp-pill) bg-[color-mix(in_srgb,var(--lp-pill)_12%,transparent)] text-(--lp-pill) dark:bg-[color-mix(in_srgb,var(--lp-pill)_18%,transparent)]'
            : 'border-default text-muted'"
        >
          <input
            v-model="form.cat"
            type="radio"
            name="category"
            :value="category"
            class="sr-only"
          >
          {{ t(`categories.${category}`) }}
        </label>
      </div>
    </fieldset>
  </form>
</template>
