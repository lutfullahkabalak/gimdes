<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { iconForCategory } from '~/utils/categoryIcon'
import { colorSetForCertificate } from '~/utils/categoryColor'
import {
  certHomeTileCornerLabel,
  certHomeTileInnerClass,
  certHomeTileLogoPanelClass,
  certHomeTileShellClass,
  getCertAlertKind,
} from '~/utils/certStatus'
import { logoUrl } from '~/utils/logoUrl'

const props = defineProps<{
  cert: Certificate
}>()

const emit = defineEmits<{
  select: [cert: Certificate]
}>()

const rawLogoUrl = computed(() => logoUrl(props.cert.MarkaLogosu))
const { src } = useCachedLogo(rawLogoUrl)

const alertKind = computed(() => getCertAlertKind(props.cert))
const isAlert = computed(() => alertKind.value !== null)
const cornerLabel = computed(() => certHomeTileCornerLabel(props.cert))
const categoryIcon = computed(() =>
  iconForCategory({ KategoriAdi: props.cert.KategoriAdi, Href: '' }),
)

const shellClass = computed(() => certHomeTileShellClass(props.cert))
const innerClass = computed(() => certHomeTileInnerClass(props.cert))
const logoPanelClass = computed(() => certHomeTileLogoPanelClass(props.cert))

const badgeClass = computed(() => {
  const kind = alertKind.value
  if (kind === 'cancelled' || kind === 'suspended')
    return 'bg-red-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-red-700/95 dark:ring-white/15'
  if (kind === 'expired')
    return 'bg-amber-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-amber-700/95 dark:ring-white/15'
  return colorSetForCertificate(props.cert).badge
})

function onSelect() {
  emit('select', props.cert)
}
</script>

<template>
  <button
    type="button"
    class="gimdes-surface group relative flex aspect-square h-full w-full min-w-0 flex-col overflow-hidden text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default"
    :class="shellClass"
    @click="onSelect"
  >
    <span
      v-if="isAlert && cornerLabel"
      class="pointer-events-none absolute top-2 right-2 z-10 flex min-h-11 min-w-11 max-w-[4.5rem] items-center justify-center rounded-full px-1.5 py-1.5 text-center text-[0.6rem] font-bold leading-tight whitespace-normal sm:text-[0.65rem]"
      :class="badgeClass"
    >
      {{ cornerLabel }}
    </span>
    <span
      v-else
      class="pointer-events-none absolute top-2 left-2 z-10 flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full shadow-sm"
      :class="badgeClass"
      :title="cert.KategoriAdi"
    >
      <UIcon :name="categoryIcon" class="size-5 shrink-0" />
    </span>
    <div
      class="flex flex-1 flex-col items-center justify-start gap-2 pt-4 px-3 pb-3 text-center"
      :class="innerClass"
    >
      <div
        class="flex h-[52%] max-h-[8.5rem] w-full shrink-0 items-center justify-center rounded-xl px-2 shadow-inner ring-1 ring-inset"
        :class="logoPanelClass || 'bg-default/80 ring-default/60'"
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
