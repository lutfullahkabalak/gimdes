<script setup lang="ts">
defineProps<{ title: string, count?: string }>()
</script>

<template>
  <section class="gimdes-surface p-5 sm:p-6">
    <div class="mb-2 flex items-baseline justify-between gap-3">
      <h2 class="text-highlighted font-display text-2xl font-extrabold">
        {{ title }}
      </h2>
      <span v-if="count" class="text-muted text-sm tabular-nums">{{ count }}</span>
    </div>
    <slot />
  </section>
</template>
