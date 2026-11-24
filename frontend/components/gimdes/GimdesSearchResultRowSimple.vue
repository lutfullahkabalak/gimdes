<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { categoryNameTr } from '~/utils/certDisplay'

defineProps<{
  cert: Certificate
  /** Arama kutusu metni; marka adında eşleşenleri sarı vurgular */
  highlightQ?: string
  hideValid?: boolean
}>()

defineEmits<{
  select: [cert: Certificate]
}>()
</script>

<template>
  <button
    type="button"
    class="group flex w-full cursor-pointer items-center gap-3 px-3 py-4 text-left transition-colors duration-300 hover:bg-paper active:bg-line/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:gap-4 sm:px-4"
    @click="$emit('select', cert)"
  >
    <GimdesBrandLogo :cert="cert" :data-brand="cert.SertifikaId" class="size-16 shrink-0 rounded-2xl border border-line p-1.5" />
    <span class="min-w-0 flex-1">
      <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="text-highlighted text-lg font-extrabold wrap-anywhere transition-colors duration-300 group-hover:text-primary">
          <GimdesSearchHighlight :text="cert.MarkaAdi" :query="highlightQ ?? ''" />
        </span>
        <GimdesStatusPill :cert="cert" :hide-valid="hideValid" />
      </span>
      <span class="text-muted mt-0.5 block text-sm leading-snug wrap-anywhere">
        {{ categoryNameTr(cert.KategoriAdi) }} · {{ cert.FirmaAdi }}
      </span>
    </span>
    <UIcon name="i-lucide-chevron-right" class="text-muted size-5 shrink-0 transition-transform duration-300 ease-soft group-hover:translate-x-1" aria-hidden="true" />
  </button>
</template>
