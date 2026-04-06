<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { certBadgeColor } from '~/utils/certStatus'
import { matchesProductAccordion } from '~/utils/matchScope'

const DEBOUNCE_MS = 400

const router = useRouter()
const route = useRoute()
const { searchCertificates } = useGimdesApi()

const {
  query: searchQ,
  results: searchResults,
  lastExecutedQuery,
  error: searchError,
  loading: searchLoading,
  accordionOpen,
  saveScroll,
  restoreScroll,
} = useSearchState()

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let searchGeneration = 0

function queryParam(v: unknown): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  return ''
}

function syncUrl(q: string) {
  if (route.path !== '/arama') return
  router.replace({ path: '/arama', query: q.length >= 3 ? { q } : {} })
}

function dedup(list: Certificate[]): Certificate[] {
  const seen = new Map<number, Certificate>()
  for (const c of list) {
    if (!seen.has(c.SertifikaId)) seen.set(c.SertifikaId, c)
  }
  return [...seen.values()]
}

function storageKey(id: number) {
  return `gimdes_cert_${id}`
}

function goBrand(cert: Certificate) {
  saveScroll()
  try {
    sessionStorage.setItem(storageKey(cert.SertifikaId), JSON.stringify(cert))
  }
  catch { /* quota exceeded */ }
  const q = searchQ.value.trim()
  router.push({
    path: `/marka/${cert.SertifikaId}`,
    query: {
      from: 'arama',
      ...(q.length >= 3 ? { q } : {}),
    },
  })
}

function toggleAccordion(id: number) {
  accordionOpen.value = { ...accordionOpen.value, [id]: !accordionOpen.value[id] }
}

function setAccordionOpen(id: number, open: boolean) {
  accordionOpen.value = { ...accordionOpen.value, [id]: open }
}

async function executeSearch(q: string) {
  const gen = ++searchGeneration
  searchError.value = ''
  searchLoading.value = true
  try {
    const raw = await searchCertificates(q)
    if (gen !== searchGeneration) return
    searchResults.value = dedup(Array.isArray(raw) ? raw : [])
    lastExecutedQuery.value = q
  }
  catch (e) {
    if (gen !== searchGeneration) return
    searchError.value = e instanceof Error ? e.message : String(e)
    searchResults.value = []
    lastExecutedQuery.value = ''
  }
  finally {
    if (gen === searchGeneration) searchLoading.value = false
  }
}

function scheduleSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)

  const q = searchQ.value.trim()

  if (q.length < 3) {
    searchResults.value = []
    searchError.value = ''
    lastExecutedQuery.value = ''
    searchLoading.value = false
    syncUrl('')
    return
  }

  if (q === lastExecutedQuery.value) {
    syncUrl(q)
    return
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = undefined
    const current = searchQ.value.trim()
    if (current.length < 3) return
    if (current === lastExecutedQuery.value) {
      syncUrl(current)
      return
    }
    syncUrl(current)
    executeSearch(current)
  }, DEBOUNCE_MS)
}

watch(searchQ, scheduleSearch)

watch(
  () => route.fullPath,
  () => {
    if (route.path !== '/arama') return
    const fromUrl = queryParam(route.query.q)
    if (fromUrl !== searchQ.value) searchQ.value = fromUrl
  },
)

onMounted(async () => {
  const urlQ = queryParam(route.query.q).trim()
  const hasCached = !!lastExecutedQuery.value && searchResults.value.length > 0

  if (urlQ && hasCached && urlQ === lastExecutedQuery.value) {
    if (searchQ.value !== urlQ) searchQ.value = urlQ
    syncUrl(urlQ)
    await restoreScroll()
  }
  else if (urlQ.length >= 3) {
    searchResults.value = []
    lastExecutedQuery.value = ''
    searchError.value = ''
    searchQ.value = urlQ
    syncUrl(urlQ)
    await executeSearch(urlQ)
  }
  else {
    searchQ.value = ''
    searchResults.value = []
    lastExecutedQuery.value = ''
    searchError.value = ''
    accordionOpen.value = {}
  }
})

onBeforeRouteLeave(() => saveScroll())

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

useHead({ title: 'Helal sertifika araması' })

const noResults = computed(() =>
  !searchLoading.value
  && searchQ.value.trim().length >= 3
  && !searchError.value
  && searchResults.value.length === 0
  && lastExecutedQuery.value === searchQ.value.trim(),
)

const showHint = computed(() =>
  searchQ.value.trim().length === 0
  && searchResults.value.length === 0
  && !searchLoading.value,
)

</script>

<template>
  <div class="flex flex-col gap-6">
    <UBreadcrumb
      :items="[
        { label: 'Ana sayfa', to: '/' },
        { label: 'Arama' },
      ]"
    />

    <!-- Search header -->
    <section
      class="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 ring-1 ring-primary/10 sm:p-6"
    >
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-highlighted text-lg font-semibold tracking-tight sm:text-xl">
            Helal sertifika araması
          </h1>
          <p class="text-muted mt-1 max-w-xl text-sm leading-relaxed">
            Marka, firma veya ürün adını yazın; sonuçlar otomatik güncellenir.
          </p>
        </div>
        <UBadge
          v-if="searchResults.length"
          color="primary"
          variant="subtle"
          size="md"
          class="shrink-0"
        >
          {{ searchResults.length }} sonuç
        </UBadge>
      </div>

      <div class="relative">
        <UInput
          v-model="searchQ"
          type="search"
          placeholder="Marka, firma veya ürün yazın…"
          autocomplete="off"
          size="xl"
          variant="outline"
          :ui="{
            base: 'h-12 rounded-[1.35rem] pl-[3.55rem] pr-12 text-base shadow-sm sm:h-14 sm:rounded-[1.65rem] sm:pl-[3.85rem] sm:text-lg',
            leading: 'pointer-events-none ps-3.5',
          }"
          class="w-full"
        >
          <template #leading>
            <UIcon name="i-lucide-search" class="size-6 shrink-0 text-primary sm:size-7" aria-hidden="true" />
          </template>
        </UInput>
        <div class="absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          <UIcon
            v-if="searchLoading"
            name="i-lucide-loader-2"
            class="text-primary size-5 animate-spin"
          />
          <button
            v-else-if="searchQ"
            type="button"
            class="text-muted hover:text-highlighted rounded-md p-0.5 transition"
            aria-label="Aramayı temizle"
            @click="searchQ = ''"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </div>
      </div>
    </section>

    <!-- Error -->
    <UAlert
      v-if="searchError"
      color="error"
      variant="subtle"
      :title="searchError"
    />

    <!-- Initial hint -->
    <div
      v-if="showHint"
      class="flex flex-col items-center gap-3 py-12 text-center"
    >
      <UIcon name="i-lucide-search" class="text-muted size-12 opacity-40" />
      <p class="text-muted max-w-xs text-sm leading-relaxed">
        Yukarıdaki kutuya yazmaya başlayın; sonuçlar hazır olduğunda listelenir.
      </p>
    </div>

    <!-- No results -->
    <div
      v-if="noResults"
      class="border-default flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center"
    >
      <UIcon name="i-lucide-search-x" class="text-muted size-10" />
      <div>
        <p class="text-highlighted text-sm font-medium">
          Sonuç bulunamadı
        </p>
        <p class="text-muted mt-1 text-sm">
          Farklı bir kelime ile tekrar deneyin.
        </p>
      </div>
    </div>

    <!-- Loading skeleton (only when no cached results) -->
    <div v-if="searchLoading && !searchResults.length" class="flex flex-col gap-3">
      <div
        v-for="n in 6"
        :key="n"
        class="gimdes-surface flex items-center gap-3 p-4"
      >
        <USkeleton class="size-12 shrink-0 rounded-xl" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-4 w-2/5 rounded-lg" />
          <USkeleton class="h-3 w-3/5 rounded-lg" />
        </div>
        <USkeleton class="h-9 w-16 shrink-0 rounded-xl" />
      </div>
    </div>

    <!-- Results -->
    <div v-if="searchResults.length" class="flex flex-col gap-3">
      <p class="text-muted text-sm">
        <span class="text-highlighted font-medium">{{ searchResults.length }}</span>
        kayıt bulundu. Ürün/kapsam eşleşmelerini görmek için satıra tıklayın.
      </p>

      <template v-for="cert in searchResults" :key="cert.SertifikaId">
        <GimdesSearchResultAccordion
          v-if="matchesProductAccordion(searchQ, cert)"
          :cert="cert"
          :open="accordionOpen[cert.SertifikaId] ?? false"
          :badge-color="certBadgeColor(cert)"
          @toggle="toggleAccordion(cert.SertifikaId)"
          @update:open="(v: boolean) => setAccordionOpen(cert.SertifikaId, v)"
          @detail="goBrand(cert)"
        >
          <GimdesSearchAccordionBody :q="searchQ" :cert="cert" />
        </GimdesSearchResultAccordion>

        <GimdesSearchResultRowSimple
          v-else
          :cert="cert"
          :badge-color="certBadgeColor(cert)"
          @select="goBrand"
        />
      </template>
    </div>
  </div>
</template>
