<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <header class="mx-auto mb-5 flex w-full max-w-5xl items-center justify-between gap-4">
    <NuxtLink
      :to="localePath('/')"
      :aria-label="t('header.home')"
      class="inline-flex rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <AppLogo />
    </NuxtLink>

    <div class="flex items-center gap-2.5">
      <nav
        :aria-label="t('header.languageSwitcher')"
        class="flex rounded-lg border border-default bg-elevated p-[3px]"
      >
        <NuxtLink
          v-for="l in locales"
          :key="l.code"
          :to="switchLocalePath(l.code)"
          :hreflang="l.code"
          :lang="l.code"
          :aria-current="l.code === locale ? 'true' : undefined"
          class="rounded-md px-3.5 py-1.5 text-[13px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :class="l.code === locale
            ? 'bg-(--lp-card) text-highlighted shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
            : 'text-muted hover:text-highlighted'"
        >
          {{ l.code.toUpperCase() }}
        </NuxtLink>
      </nav>

      <button
        type="button"
        class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-default bg-elevated px-2.5 py-2 text-highlighted hover:bg-accented focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :title="t('header.themeToggle')"
        :aria-label="t('header.themeToggle')"
        @click="toggleTheme"
      >
        <UIcon
          name="i-lucide-sun"
          class="hidden size-[17px] dark:inline-block"
        />
        <UIcon
          name="i-lucide-moon"
          class="inline-block size-[17px] dark:hidden"
        />
      </button>
    </div>
  </header>
</template>
