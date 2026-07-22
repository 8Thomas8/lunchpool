<script setup lang="ts">
const { t } = useI18n()
const localeHead = useLocaleHead({ dir: true, lang: true, seo: true })

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs ?? {},
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#f6f7f9', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#050810', media: '(prefers-color-scheme: dark)' },
    ...(localeHead.value.meta ?? [])
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ...(localeHead.value.link ?? [])
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'LunchPool',
        'url': 'https://lunchpool.vercel.app',
        'applicationCategory': 'LifestyleApplication',
        'operatingSystem': 'Web'
      })
    }
  ]
}))

useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  ogSiteName: 'LunchPool',
  ogType: 'website',
  twitterCard: 'summary'
})
</script>

<template>
  <UApp>
    <div class="min-h-screen p-[clamp(16px,4vw,40px)]">
      <a
        href="#main"
        class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[9px] focus:bg-(--lp-card) focus:px-4 focus:py-2 focus:font-semibold focus:text-highlighted focus:shadow-lg focus:outline-2 focus:outline-primary"
      >
        {{ t('a11y.skipToContent') }}
      </a>

      <AppHeader />

      <main
        id="main"
        class="mx-auto flex w-full max-w-[980px] flex-col gap-5"
      >
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
