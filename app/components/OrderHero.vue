<script setup lang="ts">
const props = withDefaults(defineProps<{
  shareUrl: string
  expiresAt?: number
  presence?: number
}>(), {
  expiresAt: () => Date.now() + ORDER_TTL_MS,
  presence: 1
})

const { t } = useI18n()
const now = useNow({ interval: 1000 })
const { copy, copied } = useClipboard({ source: () => props.shareUrl, copiedDuring: 1600 })

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS

const pad = (value: number) => String(value).padStart(2, '0')

const countdown = computed(() => {
  const remaining = props.expiresAt - now.value.getTime()
  if (remaining <= 0) return null

  const hours = Math.floor(remaining / HOUR_MS)
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS)
  const seconds = Math.floor((remaining % MINUTE_MS) / SECOND_MS)

  return `${hours}:${pad(minutes)}:${pad(seconds)}`
})
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl bg-(image:--lp-gradient-surface) p-6 text-white shadow-(--lp-shadow-hero) md:p-8">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-10 -right-10 size-[200px] rounded-full bg-black/8"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-[70px] right-15 size-[150px] rounded-full bg-black/6"
    />

    <div class="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-[26px] leading-[1.1] font-extrabold tracking-[-0.02em]">
          {{ t('hero.title') }}
        </h1>
        <p class="mt-2 max-w-[360px] text-sm">
          {{ t('hero.subtitle') }}
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-2.5">
          <p class="inline-flex items-center gap-2 rounded-full bg-black/15 px-3.5 py-1.5 text-xs font-semibold">
            <span class="size-1.5 animate-pulse rounded-full bg-white" />
            <span class="font-bold">{{ t('hero.expiresLabel') }}</span>
            <span aria-hidden="true">·</span>
            <ClientOnly>
              <span
                role="timer"
                aria-live="off"
                class="tabular-nums"
              >{{ countdown ?? t('hero.expired') }}</span>
              <template #fallback>
                <span class="tabular-nums">--:--:--</span>
              </template>
            </ClientOnly>
          </p>

          <p
            :title="t('hero.presenceTitle')"
            class="inline-flex items-center gap-[7px] rounded-full bg-black/15 px-3.5 py-1.5 text-xs font-bold"
          >
            <span class="size-1.5 animate-pulse rounded-full bg-[#4ade80] ring-3 ring-[#4ade80]/30" />
            <span class="sr-only">{{ t('hero.presenceTitle') }} :</span>
            {{ t('hero.presence', presence) }}
          </p>
        </div>
      </div>

      <div class="rounded-xl border border-white/25 bg-black/10 p-4 backdrop-blur-[6px] print:hidden md:min-w-[230px]">
        <p class="mb-2 text-xs font-semibold">
          {{ t('hero.shareTitle') }}
        </p>
        <div class="flex items-center gap-2">
          <p class="min-w-0 flex-1 truncate rounded-lg bg-black/15 px-3 py-2 font-mono text-xs">
            {{ shareUrl }}
          </p>
          <UButton
            color="neutral"
            class="rounded-lg bg-white px-3.5 py-2 text-[13px] font-bold text-(--ui-color-primary-700) hover:bg-white/90"
            @click="copy()"
          >
            {{ copied ? t('hero.copied') : t('hero.copy') }}
          </UButton>
        </div>
        <p
          aria-live="polite"
          class="sr-only"
        >
          {{ copied ? t('hero.copied') : '' }}
        </p>
      </div>
    </div>
  </section>
</template>
