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

const canSubmit = computed(() => query.value.trim().length >= 3)
const tooShort = computed(() => query.value.trim().length > 0 && !canSubmit.value)

function onSubmit() {
  if (canSubmit.value)
    emit('submit')
}
</script>

<template>
  <section class="gimdes-bleed bg-ink-900 text-white">
    <div class="grid gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:gap-16 lg:py-12">
      <div class="animate-rise min-w-0">
        <h1 class="max-w-xl text-2xl font-bold tracking-tight text-balance sm:text-4xl">
          Bu ürünün helal sertifikası var mı?
        </h1>
        <p class="mt-2 max-w-xl text-ink-100 sm:mt-3 sm:text-lg">
          Marka, firma veya ürün adıyla arayın. Sertifikanın durumunu ve hangi ürünleri kapsadığını görün.
        </p>

        <form class="mt-7 hidden max-w-2xl gap-2 lg:flex" role="search" @submit.prevent="onSubmit">
          <label class="sr-only" for="gimdes-home-search">Arama</label>
          <GimdesHomeSearchInput id="gimdes-home-search" v-model="query" large clearable @submit="onSubmit" />
          <button
            type="submit"
            class="h-14 shrink-0 cursor-pointer rounded-lg bg-emerald-400 px-7 text-lg font-bold text-ink-900 gimdes-press hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canSubmit"
          >
            Ara
          </button>
        </form>
        <p class="mt-2 hidden min-h-5 text-sm text-ink-100 lg:block" aria-live="polite">
          {{ tooShort ? 'Aramak için en az 3 harf yazın.' : '' }}
        </p>
      </div>

      <nav v-if="loading || statuses.length" class="animate-rise [animation-delay:80ms]" aria-label="Geçerli olmayan sertifikalar">
        <h2 class="mb-2 text-sm font-semibold text-ink-100">
          Geçerli olmayan sertifikalar
        </h2>
        <div v-if="loading" class="grid grid-cols-2 gap-2" role="status" aria-label="Yükleniyor">
          <div v-for="n in 4" :key="n" class="h-11 animate-pulse rounded-lg bg-ink-800 lg:h-16" />
        </div>
        <ul v-else class="animate-appear grid grid-cols-2 gap-2">
          <li v-for="item in statuses" :key="item.id">
            <button
              type="button"
              class="flex h-full min-h-11 w-full cursor-pointer flex-row items-center justify-between gap-2 rounded-lg px-3 py-2 text-left lg:flex-col lg:items-start gimdes-press lg:gap-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              :class="selectedId === item.id ? 'bg-white text-ink-900' : 'bg-ink-800 hover:bg-ink-700'"
              :aria-pressed="selectedId === item.id"
              @click="emit('select', item.id)"
            >
              <span class="order-last text-lg leading-tight font-bold tabular-nums lg:order-first lg:text-xl">{{ item.count }}</span>
              <span class="text-sm" :class="selectedId === item.id ? '' : 'text-ink-100'">{{ item.name }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </section>
</template>
