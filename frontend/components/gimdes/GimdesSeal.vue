<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { certStatusDisplay } from '~/utils/certDisplay'

/** Durum mührü: tırtıklı kenar, çevresinde dönen yazı. Durum metni ayrıca düz yazıyla da verilir. */
const props = defineProps<{ cert: Certificate }>()
const status = computed(() => certStatusDisplay(props.cert))
const fill = computed(() => ({ success: '#06261a', warning: '#9a4b00', error: '#d3122a', neutral: '#44524b' })[status.value.tone])

const scallop = computed(() => {
  const pts: string[] = []
  const n = 18
  for (let i = 0; i < 360; i += 2) {
    const a = (i / 180) * Math.PI
    const r = 92 + 6 * Math.cos(n * a)
    pts.push(`${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
})
const uid = useId()
const ring = computed(() => {
  const word = `${status.value.label.toLocaleUpperCase('tr-TR')} · `
  return word.repeat(Math.max(2, Math.round(34 / word.length)))
})
</script>

<template>
  <svg viewBox="0 0 200 200" class="block" aria-hidden="true">
    <path :d="scallop" :fill="fill" />
    <circle cx="100" cy="100" r="54" fill="none" stroke="#fff" stroke-width="2" />
    <path :id="`ring-${uid}`" d="M100,100 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" fill="none" />
    <g class="gimdes-seal-spin">
      <text fill="#fff" font-size="17" font-weight="800">
        <textPath :href="`#ring-${uid}`" textLength="396" lengthAdjust="spacing">{{ ring }}</textPath>
      </text>
    </g>
    <g fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">
      <path v-if="status.tone === 'success'" d="M74 102 l18 19 l36 -40" class="gimdes-seal-mark" pathLength="1" />
      <path v-else-if="status.tone === 'error'" d="M79 79 l42 42 M121 79 l-42 42" />
      <path v-else d="M100 70 v36 M100 128 v1" />
    </g>
  </svg>
</template>
