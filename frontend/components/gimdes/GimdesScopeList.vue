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

/** İlk gelişteki sıralı belirme yalnızca bir kez oynar; süzmede satır kapanıp açılır. */
const entering = ref(true)
let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => { timer = setTimeout(() => { entering.value = false }, 1200) })
onUnmounted(() => clearTimeout(timer))

/** Çok uzun listede yüzlerce satırı birden canlandırmak takılır; orada anında süzülür. */
const longest = ref(0)
watch(() => props.lines.length, (n) => { longest.value = Math.max(longest.value, n) }, { immediate: true })
const animate = computed(() => longest.value <= 250)
</script>

<template>
  <TransitionGroup tag="ul" name="scope-row" :css="animate">
    <li
      v-for="row in rows"
      :key="row.key"
      class="scope-row"
      :class="entering ? 'gimdes-stagger' : ''"
      :style="{ '--i': row.i / 2 }"
    >
      <div class="scope-row-inner">
        <div class="flex items-start gap-3 border-b border-line py-2.5 leading-snug">
          <UIcon
            :name="outside ? 'i-lucide-x' : inactive ? 'i-lucide-minus' : 'i-lucide-check'"
            class="mt-0.5 size-4 shrink-0"
            :class="outside ? 'text-red-600' : inactive ? 'text-muted' : 'text-emerald-700'"
            aria-hidden="true"
          />
          <span class="min-w-0 wrap-anywhere"><GimdesSearchHighlight :text="row.line" :query="query ?? ''" /></span>
        </div>
      </div>
    </li>
  </TransitionGroup>
</template>
