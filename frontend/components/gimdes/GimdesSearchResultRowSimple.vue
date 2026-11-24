<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { categoryNameTr } from '~/utils/certDisplay'

defineProps<{
  cert: Certificate
  /** Arama kutusu metni; marka adında eşleşenleri sarı vurgular */
  highlightQ?: string
}>()

defineEmits<{
  select: [cert: Certificate]
}>()
</script>

<template>
  <button
    type="button"
    class="group flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:gap-4 sm:px-4"
    @click="$emit('select', cert)"
  >
    <GimdesBrandLogo :cert="cert" class="size-14 shrink-0 rounded-lg border border-line p-1" />
    <span class="min-w-0 flex-1">
      <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="text-highlighted font-bold wrap-anywhere group-hover:text-primary">
          <GimdesSearchHighlight :text="cert.MarkaAdi" :query="highlightQ ?? ''" />
        </span>
        <GimdesStatusPill :cert="cert" />
      </span>
      <span class="text-muted mt-0.5 block text-sm leading-snug wrap-anywhere">
        {{ categoryNameTr(cert.KategoriAdi) }} · {{ cert.FirmaAdi }}
      </span>
    </span>
    <UIcon name="i-lucide-chevron-right" class="text-muted size-5 shrink-0" aria-hidden="true" />
  </button>
</template>
