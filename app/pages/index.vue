<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <UPageHero
    :title="t('home.title')"
    :description="t('home.description')"
  />
</template>
