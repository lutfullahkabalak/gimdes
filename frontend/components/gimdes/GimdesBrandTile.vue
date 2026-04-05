<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { logoUrl } from '~/utils/logoUrl'

const props = defineProps<{
  cert: Certificate
}>()

const emit = defineEmits<{
  select: [cert: Certificate]
}>()

const src = computed(() => logoUrl(props.cert.MarkaLogosu))

function onSelect() {
  emit('select', props.cert)
}
</script>

<template>
  <button
    type="button"
    class="gimdes-surface group flex aspect-square h-full w-full min-w-0 flex-col overflow-hidden text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default"
    @click="onSelect"
  >
    <div
      class="flex flex-1 flex-col items-center justify-center gap-2 bg-gradient-to-b from-elevated/90 to-default p-3 text-center"
    >
      <div
        class="flex h-[52%] max-h-[8.5rem] w-full items-center justify-center rounded-xl bg-default/80 px-2 shadow-inner ring-1 ring-inset ring-default/60"
      >
        <img
          v-if="src"
          :src="src"
          :alt="cert.MarkaAdi"
          class="max-h-full max-w-full object-contain"
        >
        <UIcon
          v-else
          name="i-lucide-award"
          class="text-muted size-14 shrink-0 opacity-80 transition group-hover:text-primary group-hover:opacity-100"
        />
      </div>
      <div class="w-full min-w-0 px-0.5">
        <p class="text-highlighted line-clamp-2 text-sm font-semibold leading-snug tracking-tight">
          {{ cert.MarkaAdi }}
        </p>
        <p class="text-muted mt-1 line-clamp-2 text-xs leading-snug">
          {{ cert.FirmaAdi }}
        </p>
      </div>
    </div>
  </button>
</template>
