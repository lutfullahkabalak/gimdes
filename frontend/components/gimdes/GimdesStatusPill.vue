<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { certStatusDisplay } from '~/utils/certDisplay'

const props = defineProps<{
  cert: Certificate
  /** Geçerli kayıtta etiketi gizler; diğer durumlar her zaman görünür */
  hideValid?: boolean
}>()
const status = computed(() => certStatusDisplay(props.cert))
const toneClass = computed(() => ({
  success: 'bg-white text-emerald-900',
  warning: 'bg-[#8a4300] text-white',
  error: 'bg-danger text-white',
  neutral: 'bg-white text-ink-900',
})[status.value.tone])
</script>

<template>
  <span v-if="!(hideValid && status.tone === 'success')" class="inline-flex w-fit ring-1 ring-ink-900/10 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap" :class="toneClass">
    <UIcon :name="status.icon" class="size-3.5 shrink-0" aria-hidden="true" />
    {{ status.label }}
  </span>
</template>
