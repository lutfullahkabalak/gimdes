<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { certCardSurfaceClass } from '~/utils/certStatus'
import { logoUrl } from '~/utils/logoUrl'

const props = defineProps<{
  cert: Certificate
  badgeColor: 'success' | 'warning' | 'error' | 'neutral'
  /** Arama kutusu metni; marka adında eşleşenleri sarı vurgular */
  highlightQ?: string
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
    class="gimdes-surface group flex w-full cursor-pointer items-center gap-3 bg-gradient-to-br from-default to-elevated/30 p-4 text-left transition duration-200 hover:-translate-y-px hover:border-primary/30 hover:shadow-md hover:ring-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default"
    :class="certCardSurfaceClass(cert)"
    @click="onSelect"
  >
    <img
      v-if="src"
      :src="src"
      alt=""
      class="size-12 shrink-0 rounded-xl border border-default/60 bg-white object-contain p-1 shadow-sm"
    >
    <UIcon
      v-else
      name="i-lucide-building-2"
      class="text-muted size-12 shrink-0 rounded-xl border border-default/60 bg-elevated/50 p-2.5"
    />

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-highlighted font-semibold transition-colors group-hover:text-primary">
          <GimdesSearchHighlight :text="cert.MarkaAdi" :query="highlightQ ?? ''" />
        </span>
        <UBadge
          :color="badgeColor"
          variant="subtle"
          size="xs"
          class="shrink-0"
        >
          {{ cert.Durum }}
        </UBadge>
      </div>
      <div class="text-muted mt-0.5 text-sm leading-snug">
        {{ cert.FirmaAdi }} · {{ cert.KategoriAdi }}
      </div>
    </div>

    <UIcon
      name="i-lucide-arrow-right"
      class="text-muted size-5 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
    />
  </button>
</template>
