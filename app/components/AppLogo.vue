<script setup lang="ts">
import logo from '~/assets/logo.svg?raw'
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <span
    class="inline-flex h-12 text-highlighted [&>svg]:h-full [&>svg]:w-auto [&>svg]:overflow-visible"
    aria-hidden="true"
    v-html="logo"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>
