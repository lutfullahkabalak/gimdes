<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { categoryNameTr } from '~/utils/certDisplay'

defineProps<{
  cert: Certificate
}>()

defineEmits<{
  select: [cert: Certificate]
}>()
</script>

<template>
  <button
    type="button"
    class="gimdes-surface gimdes-focus group flex h-full w-full min-w-0 cursor-pointer flex-col overflow-hidden gimdes-press text-left hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-ink-900/8"
    @click="$emit('select', cert)"
  >
    <GimdesBrandLogo :cert="cert" class="h-28 w-full shrink-0 p-4 transition-transform duration-500 ease-soft group-hover:scale-105 sm:h-32" />
    <span class="flex w-full flex-1 flex-col gap-1 border-t border-line bg-white p-3 sm:p-4">
      <span class="text-highlighted line-clamp-2 leading-snug font-bold wrap-anywhere transition-colors duration-300 group-hover:text-primary">{{ cert.MarkaAdi }}</span>
      <span class="text-muted line-clamp-2 text-sm leading-snug wrap-anywhere">{{ categoryNameTr(cert.KategoriAdi) }}</span>
      <span class="mt-auto pt-2"><GimdesStatusPill :cert="cert" /></span>
    </span>
  </button>
</template>
