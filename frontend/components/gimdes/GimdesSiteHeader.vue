<script setup lang="ts">
import { gimdesBrandLogoUrl } from '~/utils/logoUrl'
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-40 border-b border-line bg-white pt-[env(safe-area-inset-top)]">
    <UContainer class="flex h-16 items-center gap-3 lg:gap-8">
      <NuxtLink to="/" class="gimdes-focus flex shrink-0 items-center gap-2.5 rounded-lg" aria-label="GİMDES helal sertifikalar, ana sayfa">
        <img :src="gimdesBrandLogoUrl" alt="" width="36" height="36" class="size-9 rounded-lg">
        <span class="hidden leading-tight sm:block">
          <span class="text-highlighted block text-base font-bold">GİMDES</span>
          <span class="text-muted block text-xs">Helal sertifikalar</span>
        </span>
      </NuxtLink>
      <div class="flex min-w-0 flex-1 items-center justify-end gap-2">
        <slot />
      </div>
    </UContainer>
  </header>
</template>
