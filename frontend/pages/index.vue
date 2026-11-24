<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { iconForCategory } from '~/utils/categoryIcon'
import { categoryNameTr } from '~/utils/certDisplay'
import type { CategoryItem } from '~/components/GimdesCategoryList.vue'

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
const listLoading = useState('gimdes-home-listLoading', () => true)
const listError = useState('gimdes-home-listError', () => '')

const categoryId = useState('gimdes-home-categoryId', () => '__all__')
const categoryPickerReady = useState('gimdes-home-pickerReady', () => false)

/** Ana sayfadan arama sayfasına geçiş (API çağrısı burada yapılmaz) */
const homeSearchDraft = useState('gimdes-home-searchDraft', () => '')

/** İlk yüklemede kategori + liste çekildi; marka sayfasına gidip dönünce tekrar fetch yok. */
const homeDataBootstrapped = useState('gimdes-home-bootstrapped', () => false)

const categoryItems = computed<CategoryItem[]>(() => [
  { id: '__all__', name: 'Son güncellenenler', fullName: 'Tümü (son güncellenenler)', count: null, icon: 'i-lucide-history', group: 'recent' },
  ...categories.value.map(c => ({
    id: c.Href,
    name: categoryNameTr(c.KategoriAdi),
    fullName: c.KategoriAdi,
    count: c.SertifikaSayisi,
    icon: iconForCategory(c),
    group: c.Href.startsWith('/Kategori/') ? 'status' as const : 'product' as const,
  })),
])
const statusItems = computed(() =>
  categoryItems.value.flatMap(i => i.group === 'status' ? [{ ...i, count: i.count ?? 0 }] : []),
)
const shelfItems = computed(() => categoryItems.value.filter(i => i.group !== 'status'))
const selectedCategory = computed(() => categoryItems.value.find(i => i.id === categoryId.value))

const brandsSection = ref<HTMLElement | null>(null)
const categoryMenuOpen = ref(false)
const mobileBrandView = useState<'grid' | 'list'>('gimdes-home-mobileBrandView', () => 'grid')

function chooseCategory(id: string) {
  categoryId.value = id
  categoryMenuOpen.value = false
  // Liste ekranın üstünde veya altında kaldıysa seçimden sonra başına git.
  nextTick(() => {
    const el = brandsSection.value
    if (!el)
      return
    const { top } = el.getBoundingClientRect()
    if (top < 0 || top > window.innerHeight / 2)
      el.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
  })
}

function reloadList() {
  return categoryId.value === '__all__' ? loadDefaultBrands() : selectCategory(categoryId.value)
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

const activeBrand = useState<number | null>('gimdes-active-brand', () => null)

async function goBrand(cert: Certificate) {
  activeBrand.value = cert.SertifikaId
  try {
    sessionStorage.setItem(storageKey(cert.SertifikaId), JSON.stringify(cert))
  }
  catch {
    /* quota */
  }
  await nextTick()
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
  <div class="pt-8">
    <GimdesSiteHeader>
      <form class="min-w-0 flex-1 lg:hidden" role="search" @submit.prevent="goToSearchPage">
        <GimdesHomeSearchInput
          v-model="homeSearchDraft"
          placeholder="Marka veya ürün ara"
          aria-label="Marka veya ürün ara"
          clearable
          @submit="goToSearchPage"
        />
      </form>
      <USlideover
        v-model:open="categoryMenuOpen"
        title="Kategoriler"
        description="Markaları kategoriye göre süzün."
        :close="{ 'aria-label': 'Kategori menüsünü kapat' }"
      >
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="outline"
          size="xl"
          class="size-11 shrink-0 justify-center rounded-full bg-ink-900 text-white ring-0 hover:bg-ink-700 lg:hidden"
          aria-label="Kategori menüsünü aç"
        />
        <template #body>
          <GimdesCategoryList
            :items="categoryItems"
            :selected-id="categoryId"
            :loading="categoriesLoading"
            :error="categoriesError"
            @select="chooseCategory"
            @retry="loadCategories"
          />
        </template>
      </USlideover>
      <NuxtLink to="/arama" class="gimdes-focus gimdes-press hidden rounded-full bg-ink-900 px-5 py-2.5 font-bold text-white hover:bg-cobalt lg:block">
        Ürün ara
      </NuxtLink>
    </GimdesSiteHeader>

    <GimdesHomeSearchHero
      v-model="homeSearchDraft"
      :statuses="statusItems"
      :selected-id="categoryId"
      :loading="categoriesLoading"
      @submit="goToSearchPage"
      @select="chooseCategory"
    />

    <GimdesCategoryShelf
      :items="shelfItems"
      :selected-id="categoryId"
      :loading="categoriesLoading"
      class="pt-8 lg:pt-12"
      @select="chooseCategory"
      @all="categoryMenuOpen = true"
    />
    <UAlert
      v-if="categoriesError"
      color="error"
      variant="subtle"
      class="mt-4"
      title="Kategoriler yüklenemedi"
      :description="categoriesError"
      :actions="[{ label: 'Tekrar dene', color: 'error', variant: 'soft', onClick: () => { loadCategories() } }]"
    />

    <section ref="brandsSection" class="min-w-0 scroll-mt-24 pt-10 lg:pt-14">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div class="min-w-0" aria-live="polite">
          <h2 class="font-display text-highlighted text-3xl leading-none font-extrabold text-balance sm:text-5xl">
            {{ selectedCategory?.name ?? 'Markalar' }}
          </h2>
          <p class="text-muted mt-2 font-semibold">
            {{ listLoading ? 'Yükleniyor…' : `${listCerts.length} marka` }}
          </p>
        </div>
        <div class="relative flex shrink-0 gap-1 rounded-full bg-paper p-1" role="group" aria-label="Marka görünümü">
          <span
            class="absolute top-1 left-1 size-10 rounded-full bg-ink-900 transition-transform duration-300 ease-soft"
            :class="mobileBrandView === 'list' ? 'translate-x-11' : ''"
            aria-hidden="true"
          />
          <button
            v-for="view in ([['grid', 'Izgara görünümü', 'i-lucide-layout-grid'], ['list', 'Liste görünümü', 'i-lucide-list']] as const)"
            :key="view[0]"
            type="button"
            class="gimdes-focus gimdes-press relative flex size-10 cursor-pointer items-center justify-center rounded-full"
            :class="mobileBrandView === view[0] ? 'text-white' : 'text-muted hover:text-highlighted'"
            :aria-label="view[1]"
            :aria-pressed="mobileBrandView === view[0]"
            @click="mobileBrandView = view[0]"
          >
            <UIcon :name="view[2]" class="size-5" />
          </button>
        </div>
      </div>

      <UAlert
        v-if="listError"
        color="error"
        variant="subtle"
        class="mb-4"
        title="Markalar yüklenemedi"
        :description="listError"
        :actions="[{ label: 'Tekrar dene', color: 'error', variant: 'soft', onClick: () => { reloadList() } }]"
      />

      <div
        v-if="listLoading"
        :class="mobileBrandView === 'list' ? 'space-y-2' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5'"
      >
        <USkeleton
          v-for="n in 8"
          :key="n"
          class="rounded-[1.75rem]"
          :class="mobileBrandView === 'list' ? 'h-20' : 'h-64'"
        />
      </div>

      <div
        v-else-if="listCerts.length && mobileBrandView === 'grid'"
        class="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
      >
        <GimdesBrandTile
          v-for="(cert, i) in listCerts"
          :key="cert.SertifikaId"
          :cert="cert"
          class="gimdes-stagger"
          :style="{ '--i': Math.min(i, 11) }"
          @select="goBrand"
        />
      </div>

      <div v-else-if="listCerts.length" class="animate-rise gimdes-surface divide-y divide-line overflow-hidden">
        <GimdesSearchResultRowSimple
          v-for="(cert, i) in listCerts"
          :key="cert.SertifikaId"
          :cert="cert"
          class="gimdes-stagger"
          :style="{ '--i': Math.min(i, 11) }"
          @select="goBrand"
        />
      </div>

      <p v-else-if="!listError" class="animate-appear text-muted py-12 text-center">
        Bu listede kayıt yok.
      </p>
    </section>
  </div>
</template>
