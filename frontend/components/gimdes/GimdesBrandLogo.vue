<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { iconForCategory } from '~/utils/categoryIcon'
import { categoryColor, NO_COLOR } from '~/utils/categoryPalette'
import { getCertAlertKind } from '~/utils/certStatus'
import { logoUrl } from '~/utils/logoUrl'

const props = defineProps<{ cert: Certificate }>()
const rawLogoUrl = computed(() => logoUrl(props.cert.MarkaLogosu))
const { src, instant } = useCachedLogo(rawLogoUrl)
const failed = ref(false)
watch(src, () => { failed.value = false })
const icon = computed(() => iconForCategory({ KategoriAdi: props.cert.KategoriAdi ?? '', Href: '' }))
const invalid = computed(() => getCertAlertKind(props.cert) !== null)
const showLogo = computed(() => !!src.value && !failed.value)

/** Son açılan markanın logosu, sayfalar arasında kartından detayına taşınır. */
const activeBrand = useState<number | null>('gimdes-active-brand', () => null)
const style = computed(() => ({
  backgroundColor: showLogo.value ? '#fff' : invalid.value ? NO_COLOR : categoryColor(props.cert.KategoriAdi),
  viewTransitionName: activeBrand.value === props.cert.SertifikaId ? 'brand-logo' : undefined,
}))
</script>

<template>
  <span class="flex items-center justify-center overflow-hidden" :style="style">
    <img
      v-if="showLogo"
      :src="src!"
      alt=""
      class="max-h-full max-w-full object-contain"
      decoding="sync"
      :class="[instant ? '' : 'animate-appear', invalid ? 'opacity-60 grayscale' : '']"
      @error="failed = true"
    >
    <UIcon v-else :name="icon" class="size-1/2 max-h-12 max-w-12 text-ink-900/60" aria-hidden="true" />
  </span>
</template>
