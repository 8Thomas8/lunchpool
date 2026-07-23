<script setup lang="ts">
// Placeholder until the order API returns a real code and its expiry.
const shareUrl = 'https://lunchpool.vercel.app/o/a1b2c3'
</script>

<template>
  <OrderHero
    :share-url="shareUrl"
    :presence="4"
  />
</template>
