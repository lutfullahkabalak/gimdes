<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { certStatusDisplay } from '~/utils/certDisplay'

const props = defineProps<{ cert: Certificate }>()
const status = computed(() => certStatusDisplay(props.cert))
const toneClass = computed(() => ({
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-100 text-amber-900',
  error: 'bg-red-600 text-white',
  neutral: 'bg-slate-100 text-slate-700',
})[status.value.tone])
</script>

<template>
  <span class="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap" :class="toneClass">
    <UIcon :name="status.icon" class="size-3.5 shrink-0" aria-hidden="true" />
    {{ status.label }}
  </span>
</template>
