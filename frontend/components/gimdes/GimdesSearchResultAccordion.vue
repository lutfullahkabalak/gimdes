<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot } from 'reka-ui'
import type { Certificate } from '~/types/gimdes'
import { categoryNameTr } from '~/utils/certDisplay'
import { isOutOfScopeMatch, productLinesForAccordion } from '~/utils/matchScope'

const props = defineProps<{
  cert: Certificate
  open: boolean
  /** Arama kutusu metni; marka adında eşleşenleri sarı vurgular */
  highlightQ?: string
}>()

const emit = defineEmits<{
  toggle: []
  detail: []
  'update:open': [value: boolean]
}>()

const matchCount = computed(() => productLinesForAccordion(props.highlightQ ?? '', props.cert).length)
const outside = computed(() => isOutOfScopeMatch(props.highlightQ ?? '', props.cert))
</script>

<template>
  <CollapsibleRoot
    :open="open"
    :unmount-on-hide="false"
    @update:open="emit('update:open', $event)"
  >
    <div class="relative flex flex-wrap items-center gap-3 px-3 py-4 transition-colors duration-300 hover:bg-paper sm:flex-nowrap sm:gap-4 sm:px-4">
      <button
        type="button"
        class="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        :aria-expanded="open"
        :aria-label="`${cert.MarkaAdi}: eşleşen ürünleri göster/gizle`"
        @click="emit('toggle')"
      />
      <GimdesBrandLogo :cert="cert" :data-brand="cert.SertifikaId" class="pointer-events-none relative size-16 shrink-0 rounded-2xl border border-line p-1.5" />
      <div class="pointer-events-none relative min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="text-highlighted text-lg font-extrabold wrap-anywhere">
            <GimdesSearchHighlight :text="cert.MarkaAdi" :query="highlightQ ?? ''" />
          </span>
          <GimdesStatusPill :cert="cert" />
        </div>
        <p class="text-muted mt-0.5 text-sm leading-snug wrap-anywhere">
          {{ categoryNameTr(cert.KategoriAdi) }} · {{ cert.FirmaAdi }}
        </p>
        <p v-if="matchCount" class="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold" :class="outside ? 'bg-red-100 text-red-800' : 'bg-[#c9f7df] text-ink-900'">
          <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform duration-300 ease-soft" :class="{ 'rotate-180': open }" aria-hidden="true" />
          {{ outside ? `${matchCount} eşleşme, kapsam dışında` : `Kapsamda ${matchCount} eşleşme` }}
        </p>
      </div>
      <UButton
        label="Detay"
        color="neutral"
        variant="solid"
        size="lg"
        trailing-icon="i-lucide-chevron-right"
        class="gimdes-press relative shrink-0 rounded-full px-5 font-bold max-sm:w-full max-sm:justify-center max-sm:bg-paper max-sm:text-ink-900"
        @click.stop="emit('detail')"
      />
    </div>
    <CollapsibleContent class="overflow-hidden data-[state=closed]:animate-[collapsible-up_260ms_var(--ease-soft)] data-[state=open]:animate-[collapsible-down_360ms_var(--ease-soft)]">
      <slot />
    </CollapsibleContent>
  </CollapsibleRoot>
</template>
