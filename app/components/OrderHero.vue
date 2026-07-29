<script setup lang="ts">
const props = withDefaults(defineProps<{
  shareUrl: string
  priceEnabled: boolean
  expiresAt?: number
  presence?: number
}>(), {
  expiresAt: () => Date.now() + ORDER_TTL_MS,
  presence: 1
})

defineEmits<{
  'update:priceEnabled': [priceEnabled: boolean]
}>()

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

const countdownLabel = computed(() => countdown.value ?? t('hero.expired'))
</script>

<template>
  <section class="relative overflow-hidden rounded-xl border border-(--lp-hero-border) bg-(--lp-hero-bg) px-6 py-6 shadow-(--lp-shadow) sm:px-6.5">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-[30px] -right-[30px] size-[170px] rounded-full bg-(--lp-primary-soft) opacity-80"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-[60px] right-[70px] size-[120px] rounded-full bg-(--lp-primary-soft) opacity-50"
    />

    <div class="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div class="flex-1 md:basis-[260px]">
        <h1 class="text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] text-highlighted">
          {{ t('hero.title') }}
        </h1>
        <p class="mt-2 max-w-[400px] text-sm text-muted">
          {{ t('hero.subtitle') }}
        </p>

        <div class="mt-[18px] flex flex-wrap items-center gap-2">
          <p class="inline-flex items-center gap-2 rounded-full border border-default bg-(--lp-card) px-3 py-[5px] text-xs font-semibold text-highlighted">
            <span class="size-1.5 animate-pulse rounded-full bg-primary" />
            <span>{{ t('hero.expiresLabel') }}</span>
            <span
              aria-hidden="true"
              class="text-muted"
            >·</span>
            <ClientOnly>
              <span
                role="timer"
                class="tabular-nums text-muted"
              >
                {{ countdownLabel }}
              </span>
              <template #fallback>
                <span class="tabular-nums text-muted">--:--:--</span>
              </template>
            </ClientOnly>
          </p>

          <p
            :title="t('hero.presenceTitle')"
            class="inline-flex items-center gap-[7px] rounded-full border border-default bg-(--lp-card) px-3 py-[5px] text-xs font-semibold text-highlighted"
          >
            <span class="size-1.5 animate-pulse rounded-full bg-[#22c55e]" />
            <span class="sr-only">{{ t('hero.presenceTitle') }} :</span>
            {{ t('hero.presence', presence) }}
          </p>

          <button
            type="button"
            role="switch"
            :aria-checked="priceEnabled"
            :title="priceEnabled ? t('hero.priceToggleOff') : t('hero.priceToggleOn')"
            class="inline-flex items-center gap-[9px] rounded-full border border-default bg-(--lp-card) px-3 py-[5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary print:hidden"
            :class="priceEnabled ? 'text-primary' : 'text-muted'"
            @click="$emit('update:priceEnabled', !priceEnabled)"
          >
            <span class="text-xs font-semibold">{{ t('hero.priceToggle') }}</span>
            <span
              aria-hidden="true"
              class="flex h-[22px] w-[38px] shrink-0 items-center rounded-full px-[3px] transition-colors duration-150"
              :class="priceEnabled ? 'justify-end bg-primary' : 'justify-start bg-accented'"
            >
              <span class="size-4 shrink-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
            </span>
            <span class="text-xs font-bold">{{ priceEnabled ? t('hero.priceOn') : t('hero.priceOff') }}</span>
          </button>
        </div>
      </div>

      <div class="rounded-lg border border-default bg-(--lp-card) p-3.5 print:hidden md:min-w-[240px]">
        <p class="mb-2 text-xs font-semibold text-muted">
          {{ t('hero.shareTitle') }}
        </p>
        <div class="flex items-center gap-2">
          <p class="min-w-0 flex-1 truncate rounded-lg border border-default bg-elevated px-[11px] py-2 font-mono text-xs text-highlighted">
            {{ shareUrl }}
          </p>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-(--lp-primary-surface) px-3.5 py-[9px] text-[13px] font-semibold whitespace-nowrap text-white transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="copy()"
          >
            {{ copied ? t('hero.copied') : t('hero.copy') }}
          </button>
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
