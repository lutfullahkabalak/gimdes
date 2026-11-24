<script setup lang="ts">
defineProps<{
  lines: string[]
  outside?: boolean
  /** Sertifika geçersizse onay işareti gösterilmez */
  inactive?: boolean
  query?: string
}>()
</script>

<template>
  <ul class="divide-y divide-line">
    <li v-for="(line, i) in lines" :key="i" class="flex items-start gap-3 py-2.5 leading-snug">
      <UIcon
        :name="outside ? 'i-lucide-x' : inactive ? 'i-lucide-minus' : 'i-lucide-check'"
        class="mt-0.5 size-4 shrink-0"
        :class="outside ? 'text-red-600' : inactive ? 'text-muted' : 'text-emerald-700'"
        aria-hidden="true"
      />
      <span class="min-w-0 wrap-anywhere"><GimdesSearchHighlight :text="line" :query="query ?? ''" /></span>
    </li>
  </ul>
</template>
