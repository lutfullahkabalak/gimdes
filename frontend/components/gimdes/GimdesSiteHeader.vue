<script setup lang="ts">
import { gimdesBrandLogoUrl } from '~/utils/logoUrl'

/** Üst çubuk sayfanın rengini alır. */
withDefaults(defineProps<{ color?: string }>(), { color: '#1fd37e' })

const scrolled = ref(false)
function onScroll() {
  scrolled.value = window.scrollY > 8
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="gimdes-header fixed inset-x-0 top-0 z-40 text-ink-900 pt-[env(safe-area-inset-top)] transition-[box-shadow,background-color] duration-300 ease-soft"
    :class="scrolled ? 'shadow-lg shadow-ink-900/10' : ''"
    :style="{ backgroundColor: color }">
    <UContainer class="flex h-16 items-center gap-3 lg:gap-8">
      <NuxtLink to="/" class="gimdes-focus flex shrink-0 items-center gap-2.5 rounded-lg" aria-label="GİMDES helal sertifikalar, ana sayfa">
        <img :src="gimdesBrandLogoUrl" alt="" width="40" height="40" class="size-10 rounded-full">
        <span class="hidden leading-tight sm:block">
          <span class="font-display block text-xl leading-none font-extrabold">GİMDES</span>
          <span class="block text-xs font-semibold">Helal sertifikalar</span>
        </span>
      </NuxtLink>
      <div class="flex min-w-0 flex-1 items-center justify-end gap-2">
        <slot />
      </div>
    </UContainer>
  </header>
</template>
