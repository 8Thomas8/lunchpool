<script setup lang="ts">
const { t } = useI18n()
const { creating, failed, create } = useCreateOrderPool()

onMounted(create)
</script>

<template>
  <section class="rounded-xl border border-(--lp-hero-border) bg-(--lp-hero-bg) px-6 py-10 text-center shadow-(--lp-shadow)">
    <h1 class="text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] text-highlighted">
      {{ t('hero.title') }}
    </h1>
    <p class="mx-auto mt-2 max-w-[400px] text-sm text-muted">
      {{ t('hero.subtitle') }}
    </p>

    <template v-if="failed">
      <p class="mt-6 text-sm text-error">
        {{ t('home.createFailed') }}
      </p>
      <UButton
        class="mt-3"
        :loading="creating"
        @click="create"
      >
        {{ t('home.retry') }}
      </UButton>
    </template>

    <p
      v-else
      class="mt-6 flex items-center justify-center gap-2 text-sm text-muted"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-4 animate-spin"
      />
      {{ t('home.preparing') }}
    </p>
  </section>
</template>
