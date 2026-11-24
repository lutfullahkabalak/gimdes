<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { categoryNameTr } from '~/utils/certDisplay'
import { categoryColor, NO_COLOR } from '~/utils/categoryPalette'
import { getCertAlertKind } from '~/utils/certStatus'

const props = defineProps<{
  cert: Certificate
}>()

defineEmits<{
  select: [cert: Certificate]
}>()

const invalid = computed(() => getCertAlertKind(props.cert) !== null)
const color = computed(() => invalid.value ? NO_COLOR : categoryColor(props.cert.KategoriAdi))
</script>

<template>
  <button
    type="button"
    :data-brand="cert.SertifikaId"
    class="gimdes-focus gimdes-press group relative flex h-full w-full min-w-0 cursor-pointer flex-col rounded-[1.75rem] p-2 text-left text-ink-900 hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-18px_rgb(6_38_26/0.5)]"
    :style="{ backgroundColor: color }"
    @click="$emit('select', cert)"
  >
    <span class="block overflow-hidden rounded-[1.35rem] bg-white">
      <GimdesBrandLogo :cert="cert" class="h-32 w-full p-5 transition-transform duration-500 ease-soft group-hover:scale-105 sm:h-40" />
    </span>
    <span class="flex w-full flex-1 flex-col gap-1 px-2 pt-3 pb-2">
      <span class="line-clamp-2 text-lg leading-tight font-extrabold wrap-anywhere">{{ cert.MarkaAdi }}</span>
      <span class="line-clamp-2 text-sm leading-snug font-medium wrap-anywhere text-ink-900/80">{{ categoryNameTr(cert.KategoriAdi) }}</span>
      <GimdesStatusPill :cert="cert" hide-valid class="mt-auto" />
    </span>
  </button>
</template>
