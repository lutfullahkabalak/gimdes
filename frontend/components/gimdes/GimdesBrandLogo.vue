<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { iconForCategory } from '~/utils/categoryIcon'
import { logoUrl } from '~/utils/logoUrl'

const props = defineProps<{ cert: Certificate }>()
const rawLogoUrl = computed(() => logoUrl(props.cert.MarkaLogosu))
const { src } = useCachedLogo(rawLogoUrl)
const failed = ref(false)
watch(src, () => { failed.value = false })
const icon = computed(() => iconForCategory({ KategoriAdi: props.cert.KategoriAdi ?? '', Href: '' }))
</script>

<template>
  <span class="flex items-center justify-center overflow-hidden bg-white">
    <img
      v-if="src && !failed"
      :src="src"
      alt=""
      class="animate-appear max-h-full max-w-full object-contain"
      @error="failed = true"
    >
    <UIcon v-else :name="icon" class="size-2/5 max-h-10 max-w-10 text-slate-300" aria-hidden="true" />
  </span>
</template>
