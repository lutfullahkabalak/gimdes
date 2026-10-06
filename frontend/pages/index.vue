<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { iconForCategory } from '~/utils/categoryIcon'
import { certBadgeColor } from '~/utils/certStatus'

const HOME_SCROLL_KEY = 'gimdes_home_scroll_y'

const router = useRouter()
const { getCategories, getCertificatesByCategoryHref, getCertificateList } = useGimdesApi()

type CategoriesPayload = Awaited<ReturnType<typeof getCategories>>

/** Navigasyonlar arasında kalır (Nuxt Suspense/KeepAlive route değişiminde önbelleği sıfırlar). */
const categories = useState<CategoriesPayload>('gimdes-home-categories', () => [])
const categoriesError = useState('gimdes-home-categoriesError', () => '')
const categoriesLoading = useState('gimdes-home-categoriesLoading', () => true)

const selectedHref = useState<string | null>('gimdes-home-selectedHref', () => null)
const listCerts = useState<Certificate[]>('gimdes-home-listCerts', () => [])
const listLoading = useState('gimdes-home-listLoading', () => false)
const listError = useState('gimdes-home-listError', () => '')

const categoryId = useState('gimdes-home-categoryId', () => '__all__')
const categoryPickerReady = useState('gimdes-home-pickerReady', () => false)

/** Ana sayfadan arama sayfasına geçiş (API çağrısı burada yapılmaz) */
const homeSearchDraft = useState('gimdes-home-searchDraft', () => '')

/** İlk yüklemede kategori + liste çekildi; marka sayfasına gidip dönünce tekrar fetch yok. */
const homeDataBootstrapped = useState('gimdes-home-bootstrapped', () => false)

const categoryItems = computed(() => {
  const rows: { label: string; id: string; icon: string }[] = [
    { label: 'Tümü (son güncellenenler)', id: '__all__', icon: 'i-lucide-list-restart' },
  ]
  for (const c of categories.value) {
    rows.push({
      label: `${c.KategoriAdi} (${c.SertifikaSayisi})`,
      id: c.Href,
      icon: iconForCategory(c),
    })
  }
  return rows
})

const categoryMenuOpen = ref(false)
const mobileBrandView = useState<'grid' | 'list'>('gimdes-home-mobileBrandView', () => 'grid')

function chooseCategory(id: string) {
  categoryId.value = id
  categoryMenuOpen.value = false
}

async function loadCategories() {
  categoriesLoading.value = true
  categoriesError.value = ''
  try {
    categories.value = await getCategories()
  }
  catch (e) {
    categoriesError.value = e instanceof Error ? e.message : String(e)
    categories.value = []
  }
  finally {
    categoriesLoading.value = false
  }
}

async function loadDefaultBrands() {
  selectedHref.value = null
  listLoading.value = true
  listError.value = ''
  try {
    listCerts.value = await getCertificateList()
  }
  catch (e) {
    listError.value = e instanceof Error ? e.message : String(e)
    listCerts.value = []
  }
  finally {
    listLoading.value = false
  }
}

async function selectCategory(href: string) {
  selectedHref.value = href
  listLoading.value = true
  listError.value = ''
  try {
    listCerts.value = await getCertificatesByCategoryHref(href)
  }
  catch (e) {
    listError.value = e instanceof Error ? e.message : String(e)
    listCerts.value = []
  }
  finally {
    listLoading.value = false
  }
}

function storageKey(id: number) {
  return `gimdes_cert_${id}`
}

function goBrand(cert: Certificate) {
  try {
    sessionStorage.setItem(storageKey(cert.SertifikaId), JSON.stringify(cert))
  }
  catch {
    /* quota */
  }
  router.push({ path: `/marka/${cert.SertifikaId}` })
}

function goToSearchPage() {
  const q = homeSearchDraft.value.trim()
  if (q.length < 3)
    return
  router.push({ path: '/arama', query: { q } })
}

watch(categoryId, async (id) => {
  if (!categoryPickerReady.value)
    return
  if (id === '__all__')
    await loadDefaultBrands()
  else
    await selectCategory(id)
})

onBeforeRouteLeave((to) => {
  if (typeof to.path === 'string' && to.path.startsWith('/marka/')) {
    try {
      sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY))
    }
    catch {
      /* quota */
    }
  }
})

function restoreHomeScroll() {
  let raw: string | null = null
  try {
    raw = sessionStorage.getItem(HOME_SCROLL_KEY)
  }
  catch {
    return
  }
  if (raw == null)
    return
  try {
    sessionStorage.removeItem(HOME_SCROLL_KEY)
  }
  catch {
    /* quota */
  }
  const y = Number.parseInt(raw, 10)
  if (!Number.isFinite(y))
    return
  nextTick(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: 'auto' })
    })
  })
}

onMounted(async () => {
  if (!homeDataBootstrapped.value) {
    await loadCategories()
    if (categoryId.value === '__all__')
      await loadDefaultBrands()
    else
      await selectCategory(categoryId.value)
    await nextTick()
    categoryPickerReady.value = true
    homeDataBootstrapped.value = true
  }
  else {
    await nextTick()
    categoryPickerReady.value = true
  }
  restoreHomeScroll()
})
</script>

<template>
  <div class="flex flex-col gap-10 pt-16 lg:pt-0">
    <header class="fixed inset-x-0 top-0 z-40 flex items-center gap-2 border-b border-default bg-default/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md lg:hidden" aria-label="Arama ve kategoriler">
      <form class="min-w-0 flex-1" role="search" @submit.prevent="goToSearchPage">
        <GimdesHomeSearchInput
          v-model="homeSearchDraft"
          aria-label="Marka veya ürün ara"
          @submit="goToSearchPage"
        />
      </form>
      <USlideover
        v-model:open="categoryMenuOpen"
        title="Kategoriler"
        description="Markaları kategoriye göre filtreleyin."
        :close="{ 'aria-label': 'Kategori menüsünü kapat' }"
      >
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="outline"
          size="xl"
          class="size-12 shrink-0 justify-center"
          aria-label="Kategori menüsünü aç"
        />
        <template #body>
          <GimdesCategoryList
            :items="categoryItems"
            :selected-id="categoryId"
            :loading="categoriesLoading"
            :error="categoriesError"
            @select="chooseCategory"
          />
        </template>
      </USlideover>
    </header>

    <GimdesHomeSearchHero v-model="homeSearchDraft" @submit="goToSearchPage" />

    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
      <section class="min-w-0">
        <div class="mb-4">
          <h2 class="text-highlighted text-lg font-semibold">
            Markalar
          </h2>
          <div class="mt-3 flex gap-2 lg:hidden" role="group" aria-label="Marka görünümü">
            <UButton
              aria-label="Izgara görünümü"
              icon="i-lucide-layout-grid"
              :color="mobileBrandView === 'grid' ? 'primary' : 'neutral'"
              :variant="mobileBrandView === 'grid' ? 'soft' : 'outline'"
              :aria-pressed="mobileBrandView === 'grid'"
              size="lg"
              class="size-11 justify-center"
              @click="mobileBrandView = 'grid'"
            />
            <UButton
              aria-label="Liste görünümü"
              icon="i-lucide-list"
              :color="mobileBrandView === 'list' ? 'primary' : 'neutral'"
              :variant="mobileBrandView === 'list' ? 'soft' : 'outline'"
              :aria-pressed="mobileBrandView === 'list'"
              size="lg"
              class="size-11 justify-center"
              @click="mobileBrandView = 'list'"
            />
          </div>
        </div>

        <UAlert
          v-if="listError"
          color="error"
          variant="subtle"
          class="mb-4"
          :title="listError"
        />

        <div
          v-if="listLoading"
          class="grid gap-4 lg:grid-cols-3 xl:grid-cols-4"
          :class="mobileBrandView === 'list' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'"
        >
          <USkeleton
            v-for="n in 10"
            :key="n"
            class="rounded-2xl lg:aspect-square lg:h-auto"
            :class="mobileBrandView === 'list' ? 'h-24' : 'aspect-square'"
          />
        </div>

        <div
          v-else
          class="grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4"
          :class="mobileBrandView === 'list' ? 'hidden lg:grid' : ''"
        >
          <GimdesBrandTile
            v-for="cert in listCerts"
            :key="cert.SertifikaId"
            :cert="cert"
            @select="goBrand"
          />
        </div>

        <div v-if="!listLoading && mobileBrandView === 'list'" class="flex flex-col gap-3 lg:hidden">
          <GimdesSearchResultRowSimple
            v-for="cert in listCerts"
            :key="cert.SertifikaId"
            :cert="cert"
            :badge-color="certBadgeColor(cert)"
            @select="goBrand"
          />
        </div>

        <p
          v-if="!listLoading && !listCerts.length"
          class="text-muted py-8 text-center text-sm"
        >
          Bu listede kayıt yok.
        </p>
      </section>

      <aside class="gimdes-category-scroll sticky top-8 hidden max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-2xl border border-default bg-default p-4 lg:block" aria-label="Kategoriler">
        <h2 class="text-highlighted mb-4 text-lg font-semibold">
          Kategoriler
        </h2>
        <GimdesCategoryList
          :items="categoryItems"
          :selected-id="categoryId"
          :loading="categoriesLoading"
          :error="categoriesError"
          @select="chooseCategory"
        />
      </aside>
    </div>
  </div>
</template>
