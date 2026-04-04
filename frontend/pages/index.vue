<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { iconForCategory } from '~/utils/categoryIcon'
import { gimdesBrandLogoUrl, logoUrl } from '~/utils/logoUrl'

const router = useRouter()
const { getCategories, getCertificatesByCategoryHref, getCertificateList } = useGimdesApi()

const categories = ref<Awaited<ReturnType<typeof getCategories>>>([])
const categoriesError = ref('')
const categoriesLoading = ref(true)

const selectedHref = ref<string | null>(null)
const listCerts = ref<Certificate[]>([])
const listLoading = ref(false)
const listError = ref('')

const categoryId = ref('__all__')
const categoryPickerReady = ref(false)

/** Ana sayfadan arama sayfasına geçiş (API çağrısı burada yapılmaz) */
const homeSearchDraft = ref('')

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

const selectedCategoryIcon = computed(() => {
  const row = categoryItems.value.find(r => r.id === categoryId.value)
  return row?.icon ?? 'i-lucide-layout-grid'
})

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

onMounted(async () => {
  await loadCategories()
  await loadDefaultBrands()
  await nextTick()
  categoryPickerReady.value = true
})
</script>

<template>
  <div class="flex flex-col gap-10">
    <UCard
      class="border-primary/20 from-primary/5 ring-primary/10 overflow-hidden bg-gradient-to-br to-default ring-1"
      variant="subtle"
      :ui="{ body: 'p-5 sm:p-6 flex flex-col gap-5 sm:gap-6' }"
    >
      <div
        class="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-start sm:gap-4"
      >
        <img
          :src="gimdesBrandLogoUrl"
          alt=""
          class="h-14 w-auto max-w-[min(100%,200px)] shrink-0 object-contain sm:h-16 sm:max-w-[240px]"
          width="240"
          height="64"
          loading="eager"
          fetchpriority="high"
        >
        <span class="text-highlighted text-center text-2xl font-bold tracking-tight sm:text-left sm:text-3xl md:text-4xl">
          GİMDES
        </span>
      </div>

      <div class="border-default flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-end sm:pt-6">
        <UInput
          v-model="homeSearchDraft"
          type="search"
          icon="i-lucide-search"
          placeholder="Örn. piliç, süt, baharat…"
          autocomplete="off"
          size="lg"
          variant="outline"
          class="w-full flex-1"
          @keydown.enter.prevent="goToSearchPage"
        />
        <UButton
          label="Ara"
          color="primary"
          variant="solid"
          size="lg"
          class="shrink-0"
          :disabled="homeSearchDraft.trim().length < 3"
          @click="goToSearchPage"
        />
      </div>
    </UCard>

    <section>
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-highlighted text-lg font-semibold">
            Kategori
          </h2>
        </div>
        <UButton
          v-if="categoryId !== '__all__'"
          label="Tüm markalar"
          color="neutral"
          variant="outline"
          size="sm"
          @click="categoryId = '__all__'"
        />
      </div>

      <UAlert
        v-if="categoriesError"
        color="error"
        variant="subtle"
        class="mb-4"
        :title="categoriesError"
      />

      <USelectMenu
        v-model="categoryId"
        value-key="id"
        :items="categoryItems"
        :loading="categoriesLoading"
        :disabled="categoriesLoading && !categories.length"
        placeholder="Kategori seçin…"
        searchable
        class="max-w-md w-full"
        size="lg"
      >
        <template #leading>
          <UIcon :name="selectedCategoryIcon" class="text-muted size-5" />
        </template>
      </USelectMenu>
    </section>

    <section>
      <div class="mb-4">
        <h2 class="text-highlighted text-lg font-semibold">
          Markalar
        </h2>
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
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <USkeleton v-for="n in 10" :key="n" class="aspect-square rounded-xl" />
      </div>

      <div
        v-else
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <UCard
          v-for="cert in listCerts"
          :key="cert.SertifikaId"
          class="aspect-square cursor-pointer transition hover:ring-2 hover:ring-primary"
          :ui="{
            root: 'flex h-full flex-col overflow-hidden',
            body: 'flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center',
          }"
          variant="subtle"
          @click="goBrand(cert)"
        >
          <img
            v-if="logoUrl(cert.MarkaLogosu)"
            :src="logoUrl(cert.MarkaLogosu)!"
            :alt="cert.MarkaAdi"
            class="size-40 max-h-[52%] object-contain"
          >
          <UIcon
            v-else
            name="i-lucide-award"
            class="text-muted size-20 shrink-0"
          />
          <div class="w-full min-w-0">
            <p class="line-clamp-2 text-sm font-semibold leading-tight">
              {{ cert.MarkaAdi }}
            </p>
            <p class="text-muted mt-1 line-clamp-2 text-xs leading-tight">
              {{ cert.FirmaAdi }}
            </p>
          </div>
        </UCard>
      </div>

      <p
        v-if="!listLoading && !listCerts.length"
        class="text-muted py-8 text-center text-sm"
      >
        Bu listede kayıt yok.
      </p>
    </section>
  </div>
</template>
