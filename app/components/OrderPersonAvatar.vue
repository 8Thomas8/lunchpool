<script setup lang="ts">
const props = defineProps<{
  person: string
}>()

const hue = computed(() => orderPersonHue(props.person))

const initials = computed(() => orderPersonInitials(props.person))
</script>

<template>
  <span
    aria-hidden="true"
    :style="{ '--lp-hue': hue }"
    class="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[hsl(var(--lp-hue)_75%_92%)] text-xs font-extrabold text-[hsl(var(--lp-hue)_55%_40%)] dark:bg-[hsl(var(--lp-hue)_38%_26%)] dark:text-[hsl(var(--lp-hue)_70%_72%)]"
  >
    {{ initials }}
  </span>
</template>
