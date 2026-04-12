<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot } from 'reka-ui'
import type { Certificate } from '~/types/gimdes'
import { certCardSurfaceClass } from '~/utils/certStatus'
import { logoUrl } from '~/utils/logoUrl'

const props = defineProps<{
  cert: Certificate
  open: boolean
  badgeColor: 'success' | 'warning' | 'error' | 'neutral'
  /** Arama kutusu metni; marka adında eşleşenleri sarı vurgular */
  highlightQ?: string
}>()

const emit = defineEmits<{
  toggle: []
  detail: []
  'update:open': [value: boolean]
}>()

const src = computed(() => logoUrl(props.cert.MarkaLogosu))
</script>

<template>
  <div
    class="gimdes-surface overflow-hidden bg-gradient-to-br from-default to-elevated/25 transition-shadow duration-200 hover:shadow-md"
    :class="certCardSurfaceClass(cert)"
  >
    <CollapsibleRoot
      :open="open"
      :unmount-on-hide="false"
      class="flex min-w-0 flex-col"
      @update:open="emit('update:open', $event)"
    >
      <div class="relative flex min-h-[3.75rem] w-full items-center gap-3 px-4 py-3.5">
        <button
          type="button"
          class="absolute inset-0 z-0 cursor-pointer text-left transition outline-none hover:bg-elevated/50 focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          :aria-expanded="open"
          aria-label="Eşleşen ürünleri göster/gizle"
          @click="emit('toggle')"
        />

        <div class="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-3">
          <img
            v-if="src"
            :src="src"
            alt=""
            class="size-12 shrink-0 rounded-xl border border-default/60 bg-white object-contain p-1 shadow-sm"
          >
          <UIcon
            v-else
            name="i-lucide-package"
            class="text-muted size-12 shrink-0 rounded-xl border border-default/60 bg-elevated/50 p-2.5"
          />

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-highlighted truncate font-semibold">
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
            <div class="text-muted truncate text-sm">
              {{ cert.FirmaAdi }} · {{ cert.KategoriAdi }}
            </div>
          </div>

          <UIcon
            name="i-lucide-chevron-down"
            class="text-muted size-5 shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': open }"
          />
        </div>

        <UButton
          label="Detay"
          size="md"
          color="primary"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
          class="relative z-20 shrink-0"
          @click.stop="emit('detail')"
        />
      </div>

      <CollapsibleContent
        class="data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden"
      >
        <slot />
      </CollapsibleContent>
    </CollapsibleRoot>
  </div>
</template>
