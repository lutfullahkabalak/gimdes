<script setup lang="ts">
const props = defineProps<{
  lines: string[]
  outside?: boolean
  /** Sertifika geçersizse onay işareti gösterilmez */
  inactive?: boolean
  query?: string
}>()

/** Süzerken satırlar korunur; aynı metin tekrarlarsa sıra numarasıyla ayrışır. */
const rows = computed(() => {
  const seen = new Map<string, number>()
  return props.lines.map((line, i) => {
    const n = seen.get(line) ?? 0
    seen.set(line, n + 1)
    return { line, key: `${line}#${n}`, i: Math.min(i, 11) }
  })
})
</script>

<template>
  <ul class="divide-y divide-line">
    <li v-for="row in rows" :key="row.key" :style="{ '--i': row.i / 2 }" class="gimdes-stagger flex items-start gap-3 py-2.5 leading-snug">
      <UIcon
        :name="outside ? 'i-lucide-x' : inactive ? 'i-lucide-minus' : 'i-lucide-check'"
        class="mt-0.5 size-4 shrink-0"
        :class="outside ? 'text-red-600' : inactive ? 'text-muted' : 'text-emerald-700'"
        aria-hidden="true"
      />
      <span class="min-w-0 wrap-anywhere"><GimdesSearchHighlight :text="row.line" :query="query ?? ''" /></span>
    </li>
  </ul>
</template>
