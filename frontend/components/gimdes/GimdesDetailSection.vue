<script setup lang="ts">
defineProps<{ title: string, count?: string }>()
</script>

<template>
  <section class="gimdes-surface p-4 sm:p-5">
    <div class="mb-2 flex items-baseline justify-between gap-3">
      <h2 class="text-highlighted text-lg font-bold">
        {{ title }}
      </h2>
      <span v-if="count" class="text-muted text-sm tabular-nums">{{ count }}</span>
    </div>
    <slot />
  </section>
</template>
