<script setup lang="ts">
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
      :seed="query.trim()"
      :colors="ROSETTE"
      class="gimdes-bloom absolute -right-40 -bottom-44 w-[26rem] opacity-90 sm:-right-24 sm:w-[34rem] lg:top-1/2 lg:right-[max(-6rem,calc(50vw-46rem))] lg:bottom-auto lg:w-[44rem] lg:-translate-y-1/2"
    />
    <div class="relative flex min-h-[25rem] flex-col justify-center py-9 lg:min-h-[34rem] lg:max-w-[44rem] lg:py-14">
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

      <nav v-if="loading || statuses.length" class="animate-rise mt-6 max-w-[19rem] [animation-delay:550ms] sm:max-w-none lg:mt-3" aria-label="Geçerli olmayan sertifikalar">
        <h2 class="mb-2 font-bold">
          Bunlara dikkat: geçerli değiller
        </h2>
        <div class="flex min-h-11 flex-wrap gap-2">
          <button
            v-for="item in statuses"
            :key="item.id"
            type="button"
            class="animate-appear gimdes-press gimdes-focus flex h-11 cursor-pointer items-center gap-2 rounded-full pr-4 pl-1.5 font-semibold hover:-translate-y-0.5"
            :class="selectedId === item.id ? 'bg-white text-ink-900' : 'bg-ink-900 text-white'"
            :aria-pressed="selectedId === item.id"
            @click="emit('select', item.id)"
          >
            <span class="flex h-8 min-w-8 items-center justify-center rounded-full bg-danger px-2 text-sm font-bold text-white tabular-nums">{{ item.count }}</span>
            {{ item.name }}
          </button>
        </div>
      </nav>
    </div>
  </section>
</template>
