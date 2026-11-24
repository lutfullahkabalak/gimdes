<script setup lang="ts">
import { SHOW_ROSETTE } from '~/utils/features'

const query = defineModel<string>({ required: true })

defineProps<{
  statuses: { id: string, name: string, count: number, icon: string }[]
  selectedId: string
  loading: boolean
}>()

const emit = defineEmits<{
  submit: []
  select: [id: string]
}>()

const ROSETTE = ['#ffffff', '#ffe14d', '#ff5c8a', '#2c4bff', '#06261a']
const canSubmit = computed(() => query.value.trim().length >= 3)
const tooShort = computed(() => query.value.trim().length > 0 && !canSubmit.value)

function onSubmit() {
  if (canSubmit.value)
    emit('submit')
}
</script>

<template>
  <section class="gimdes-bleed relative -mt-px overflow-hidden bg-brand text-ink-900">
    <GimdesRosette
      v-if="SHOW_ROSETTE"
      :seed="query.trim()"
      :colors="ROSETTE"
      class="gimdes-bloom absolute -right-40 -bottom-44 w-[26rem] opacity-90 sm:-right-24 sm:w-[34rem] lg:top-1/2 lg:right-[max(-6rem,calc(50vw-46rem))] lg:bottom-auto lg:w-[44rem] lg:-translate-y-1/2"
    />
    <div class="relative grid items-center gap-6 py-9 lg:grid-cols-[minmax(0,44rem)_20rem] lg:justify-between lg:gap-12 lg:py-16">
      <div class="min-w-0">
        <h1 class="gimdes-words font-display text-[3.35rem] leading-[0.92] font-extrabold tracking-[-0.035em] sm:text-7xl lg:text-[6.25rem]">
          <span style="--i: 0">Aldığın</span> <span style="--i: 2">ürün</span><br>
          <span style="--i: 4">sertifikalı</span> <span style="--i: 6">mı?</span>
        </h1>
        <p class="animate-rise mt-4 max-w-md text-lg leading-snug font-medium [animation-delay:350ms] lg:mt-6 lg:text-xl">
          Markayı, firmayı ya da ürünü yaz. Durumunu ve neleri kapsadığını hemen gör.
        </p>

        <form class="animate-rise mt-7 hidden w-full max-w-2xl items-center gap-2 rounded-full bg-white p-2 shadow-[0_18px_50px_-12px_rgb(6_38_26/0.45)] [animation-delay:450ms] lg:flex" role="search" @submit.prevent="onSubmit">
          <label class="sr-only" for="gimdes-home-search">Arama</label>
          <GimdesHomeSearchInput id="gimdes-home-search" v-model="query" large clearable @submit="onSubmit" />
          <button
            type="submit"
            class="gimdes-press gimdes-focus h-14 shrink-0 cursor-pointer rounded-full bg-ink-900 px-9 text-lg font-bold text-white hover:bg-cobalt disabled:cursor-not-allowed disabled:bg-ink-900/60"
            :disabled="!canSubmit"
          >
            Ara
          </button>
        </form>
        <p class="mt-2 hidden min-h-6 px-6 font-semibold lg:block" aria-live="polite">
          {{ tooShort ? 'Aramak için en az 3 harf yaz.' : '' }}
        </p>
      </div>

      <nav v-if="loading || statuses.length" class="animate-rise [animation-delay:550ms]" aria-label="Geçerli olmayan sertifikalar">
        <h2 class="mb-3 font-bold lg:text-lg">
          Bunlara dikkat: geçerli değiller
        </h2>
        <div class="grid min-h-24 grid-cols-2 content-start gap-2 sm:grid-cols-4 lg:grid-cols-1">
          <button
            v-for="item in statuses"
            :key="item.id"
            type="button"
            class="animate-appear gimdes-press gimdes-focus flex h-11 cursor-pointer items-center gap-2 rounded-full pr-3 pl-1.5 text-left text-sm leading-tight font-semibold sm:text-base lg:h-14 lg:gap-3 lg:pl-2.5 lg:text-lg hover:-translate-y-0.5"
            :class="selectedId === item.id ? 'bg-white text-ink-900' : 'bg-ink-900 text-white'"
            :aria-pressed="selectedId === item.id"
            @click="emit('select', item.id)"
          >
            <span class="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-danger px-2 text-sm font-bold text-white tabular-nums">{{ item.count }}</span>
            {{ item.name }}
          </button>
        </div>
      </nav>
    </div>
  </section>
</template>
