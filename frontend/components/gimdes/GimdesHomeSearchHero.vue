<script setup lang="ts">
import { gimdesBrandLogoUrl } from '~/utils/logoUrl'

const query = defineModel<string>({ required: true })

const emit = defineEmits<{
  submit: []
}>()

const canSubmit = computed(() => query.value.trim().length >= 3)

function onSubmit() {
  if (!canSubmit.value)
    return
  emit('submit')
}
</script>

<template>
  <section
    class="gimdes-surface relative overflow-hidden border-primary/15 ring-primary/10"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/18 via-primary/6 to-transparent"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -end-20 -top-28 size-72 rounded-full bg-primary/25 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-24 -start-16 size-56 rounded-full bg-primary/15 blur-3xl"
      aria-hidden="true"
    />

    <div class="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div
            class="flex h-28 w-full max-w-[min(100%,300px)] items-center justify-center rounded-2xl border border-default/50 bg-default/70 px-5 py-4 shadow-inner ring-1 ring-inset ring-white/40 sm:h-36 sm:max-w-[340px] dark:ring-white/5"
          >
            <img
              :src="gimdesBrandLogoUrl"
              alt=""
              class="h-[4.75rem] w-auto max-h-full max-w-full object-contain sm:h-[6.25rem] md:h-[6.75rem]"
              width="320"
              height="120"
              loading="eager"
              fetchpriority="high"
            >
          </div>
          <div class="text-center sm:text-left">
            <p class="text-primary text-xs font-semibold uppercase tracking-widest opacity-90">
              Helal sertifika
            </p>
            <h1 class="text-highlighted mt-1 text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-tight">
              GİMDES
            </h1>
          </div>
        </div>
      </div>

      <div class="border-default/70 border-t border-dashed pt-6">
        <label class="text-muted mb-2 block text-xs font-medium sm:sr-only" for="gimdes-home-search">
          Arama
        </label>
        <UInput
          id="gimdes-home-search"
          v-model="query"
          type="search"
          placeholder="Örn. piliç, süt, baharat…"
          autocomplete="off"
          size="xl"
          variant="outline"
          :ui="{
            base: 'h-12 rounded-[1.35rem] pl-[3.55rem] text-base shadow-sm sm:h-14 sm:rounded-[1.65rem] sm:pl-[3.85rem] sm:text-lg',
            leading: 'pointer-events-none ps-3.5',
          }"
          class="w-full"
          @keydown.enter.prevent="onSubmit"
        >
          <template #leading>
            <UIcon name="i-lucide-search" class="size-6 shrink-0 text-primary sm:size-7" aria-hidden="true" />
          </template>
        </UInput>
      </div>
    </div>
  </section>
</template>
