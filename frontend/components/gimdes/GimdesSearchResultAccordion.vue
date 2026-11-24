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
    <div class="relative flex flex-wrap items-center gap-3 px-3 py-3 transition-colors hover:bg-paper sm:flex-nowrap sm:gap-4 sm:px-4">
      <button
        type="button"
        class="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        :aria-expanded="open"
        :aria-label="`${cert.MarkaAdi}: eşleşen ürünleri göster/gizle`"
        @click="emit('toggle')"
      />
      <GimdesBrandLogo :cert="cert" class="pointer-events-none relative size-14 shrink-0 rounded-lg border border-line p-1" />
      <div class="pointer-events-none relative min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="text-highlighted font-bold wrap-anywhere">
            <GimdesSearchHighlight :text="cert.MarkaAdi" :query="highlightQ ?? ''" />
          </span>
          <GimdesStatusPill :cert="cert" />
        </div>
        <p class="text-muted mt-0.5 text-sm leading-snug wrap-anywhere">
          {{ categoryNameTr(cert.KategoriAdi) }} · {{ cert.FirmaAdi }}
        </p>
        <p v-if="matchCount" class="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold" :class="outside ? 'text-red-700' : 'text-primary'">
          <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform" :class="{ 'rotate-180': open }" aria-hidden="true" />
          {{ outside ? `${matchCount} eşleşme, kapsam dışında` : `Kapsamda ${matchCount} eşleşme` }}
        </p>
      </div>
      <UButton
        label="Detay"
        color="neutral"
        variant="outline"
        size="lg"
        trailing-icon="i-lucide-chevron-right"
        class="relative shrink-0 max-sm:w-full max-sm:justify-center"
        @click.stop="emit('detail')"
      />
    </div>
    <CollapsibleContent class="overflow-hidden data-[state=closed]:animate-[collapsible-up_200ms_ease-out] data-[state=open]:animate-[collapsible-down_200ms_ease-out]">
      <slot />
    </CollapsibleContent>
  </CollapsibleRoot>
</template>
