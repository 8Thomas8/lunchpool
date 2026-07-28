<script setup lang="ts">
const shareUrl = 'https://lunchpool.vercel.app/o/a1b2c3'
</script>

<template>
  <div class="contents">
    <OrderHero
      :share-url="shareUrl"
      :presence="4"
    />
    <OrderAddForm />
  </div>
</template>
