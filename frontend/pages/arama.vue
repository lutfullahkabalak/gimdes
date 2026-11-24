<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
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

const activeBrand = useState<number | null>('gimdes-active-brand', () => null)

async function goBrand(cert: Certificate) {
  activeBrand.value = cert.SertifikaId
  saveScroll()
  try {
    sessionStorage.setItem(storageKey(cert.SertifikaId), JSON.stringify(cert))
  }
  catch { /* quota exceeded */ }
  const q = searchQ.value.trim()
  await nextTick()
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
  <div class="mx-auto max-w-4xl pt-8">
    <GimdesSiteHeader>
      <div class="min-w-0 flex-1" role="search">
        <GimdesHomeSearchInput
          v-model="searchQ"
          placeholder="Marka, firma veya ürün yazın…"
          aria-label="Marka, firma veya ürün ara"
          :loading="searchLoading"
          clearable
        />
      </div>
    </GimdesSiteHeader>

    <div class="gimdes-bleed relative -mt-px mb-6 overflow-hidden bg-brand text-ink-900">
      <GimdesRosette
        :seed="searchQ.trim()"
        :colors="['#ffffff', '#ffe14d', '#ff5c8a', '#2c4bff']"
        class="gimdes-bloom absolute top-1/2 -right-32 w-80 -translate-y-1/2 sm:right-0 sm:w-[26rem]"
      />
      <div class="animate-rise relative py-7 pr-36 sm:py-10 sm:pr-80">
      <UBreadcrumb
        :items="[
          { label: 'Ana sayfa', to: '/' },
          { label: 'Arama' },
        ]"
        class="mb-4"
        :ui="{ link: 'text-ink-900 hover:text-ink-900 font-semibold', separatorIcon: 'text-ink-900' }"
      />
      <h1 class="font-display text-4xl leading-none font-extrabold tracking-[-0.03em] text-balance wrap-anywhere sm:text-6xl">
        {{ lastExecutedQuery ? lastExecutedQuery : 'Helal sertifika araması' }}
      </h1>
      <p class="mt-3 text-lg font-medium" aria-live="polite">
        <template v-if="searchLoading">
          Aranıyor…
        </template>
        <template v-else-if="searchResults.length">
          {{ searchResults.length }} kayıt bulundu. Eşleşen ürünleri görmek için satıra dokunun.
        </template>
        <template v-else-if="searchQ.trim().length > 0 && searchQ.trim().length < 3">
          Aramak için en az 3 harf yazın.
        </template>
        <template v-else-if="showHint">
          Marka, firma veya ürün adını yazın; sonuçlar kendiliğinden listelenir.
        </template>
      </p>
    </div>
    </div>

    <UAlert
      v-if="searchError"
      color="error"
      variant="subtle"
      class="mb-4"
      title="Arama tamamlanamadı"
      :description="searchError"
      :actions="[{ label: 'Tekrar dene', color: 'error', variant: 'soft', onClick: () => { executeSearch(searchQ.trim()) } }]"
    />

    <div v-if="noResults" class="animate-rise gimdes-surface flex flex-col items-center gap-2 px-4 py-14 text-center">
      <UIcon name="i-lucide-search-x" class="text-muted size-9" />
      <p class="text-highlighted text-lg font-bold">
        Sonuç bulunamadı
      </p>
      <p class="text-muted max-w-sm">
        Yazımı kontrol edin veya daha kısa, genel bir kelimeyle deneyin.
      </p>
    </div>

    <div v-if="searchLoading && !searchResults.length" class="animate-appear gimdes-surface divide-y divide-line">
      <div v-for="n in 6" :key="n" class="flex items-center gap-4 p-4">
        <USkeleton class="size-14 shrink-0 rounded-lg" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-4 w-2/5" />
          <USkeleton class="h-3 w-3/5" />
        </div>
      </div>
    </div>

    <div
      v-if="searchResults.length"
      class="gimdes-surface animate-rise divide-y divide-line overflow-hidden transition-opacity duration-300"
      :class="{ 'opacity-60': searchLoading }"
    >
      <template v-for="cert in searchResults" :key="cert.SertifikaId">
        <GimdesSearchResultAccordion
          v-if="matchesProductAccordion(searchQ, cert)"
          :cert="cert"
          :highlight-q="searchQ"
          :open="accordionOpen[cert.SertifikaId] ?? false"
          @toggle="toggleAccordion(cert.SertifikaId)"
          @update:open="(v: boolean) => setAccordionOpen(cert.SertifikaId, v)"
          @detail="goBrand(cert)"
        >
          <GimdesSearchAccordionBody :q="searchQ" :cert="cert" />
        </GimdesSearchResultAccordion>

        <GimdesSearchResultRowSimple
          v-else
          :cert="cert"
          :highlight-q="searchQ"
          @select="goBrand"
        />
      </template>
    </div>
  </div>
</template>
