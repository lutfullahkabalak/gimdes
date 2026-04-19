<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Certificate } from '~/types/gimdes'
import { certDetailPageShellClass, getCertAlertKind } from '~/utils/certStatus'
import { certificateThumbSrc, listCertificateImages } from '~/utils/certImages'
import { logoUrl } from '~/utils/logoUrl'
import { stripHtml, tableGlobalFilterTr } from '~/utils/matchScope'

type ScopeLineRow = { id: number; metin: string }

const route = useRoute()
const sertifikaId = computed(() => String(route.params.sertifikaId ?? ''))

function queryFirst(v: unknown): string {
  if (typeof v === 'string')
    return v
  if (Array.isArray(v) && typeof v[0] === 'string')
    return v[0]
  return ''
}

const homeTo = computed(() => {
  const qStr = queryFirst(route.query.q)
  const fromArama = queryFirst(route.query.from) === 'arama'

  if (fromArama)
    return qStr ? { path: '/arama', query: { q: qStr } } : '/arama'

  if (qStr)
    return { path: '/arama', query: { q: qStr } }

  return '/'
})

const homeCrumbLabel = computed(() =>
  queryFirst(route.query.from) === 'arama' ? 'Arama' : 'Ana sayfa',
)

const cert = ref<Certificate | null>(null)
const missing = ref(false)

const rawLogoUrl = computed(() => logoUrl(cert.value?.MarkaLogosu ?? null))
const { src: logo } = useCachedLogo(rawLogoUrl)

const certImages = computed(() =>
  cert.value ? listCertificateImages(cert.value) : [],
)

const lightboxIndex = ref<number | null>(null)
const lightboxZoom = ref(1)

const minLightboxZoom = 0.5
const maxLightboxZoom = 4

const lightboxUrl = computed(() => {
  const i = lightboxIndex.value
  if (i === null)
    return null
  return certImages.value[i]?.url ?? null
})

const lightboxHasMultiple = computed(() => certImages.value.length > 1)

function openCertLightbox(index: number) {
  lightboxZoom.value = 1
  lightboxIndex.value = index
}

function closeCertLightbox() {
  lightboxIndex.value = null
  lightboxZoom.value = 1
}

function resetLightboxZoom() {
  lightboxZoom.value = 1
}

function bumpLightboxZoom(delta: number) {
  const next = Math.round((lightboxZoom.value + delta) * 100) / 100
  lightboxZoom.value = Math.min(maxLightboxZoom, Math.max(minLightboxZoom, next))
}

function multiplyLightboxZoom(factor: number) {
  const next = lightboxZoom.value * factor
  lightboxZoom.value = Math.min(maxLightboxZoom, Math.max(minLightboxZoom, Math.round(next * 100) / 100))
}

function stepCertLightbox(delta: number) {
  const imgs = certImages.value
  const cur = lightboxIndex.value
  if (!imgs.length || cur === null)
    return
  lightboxZoom.value = 1
  const n = imgs.length
  let next = (cur + delta) % n
  if (next < 0)
    next += n
  lightboxIndex.value = next
}

function onCertLightboxKeydown(e: KeyboardEvent) {
  if (lightboxIndex.value === null)
    return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeCertLightbox()
    return
  }
  if (e.key === '+' || e.key === '=') {
    e.preventDefault()
    bumpLightboxZoom(0.25)
    return
  }
  if (e.key === '-' || e.key === '_') {
    e.preventDefault()
    bumpLightboxZoom(-0.25)
    return
  }
  if (e.key === '0') {
    e.preventDefault()
    resetLightboxZoom()
    return
  }
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    stepCertLightbox(1)
    return
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    stepCertLightbox(-1)
  }
}

function onCertLightboxWheel(e: WheelEvent) {
  if (lightboxIndex.value === null)
    return
  if (e.ctrlKey || e.metaKey) {
    if (e.deltaY > 0)
      multiplyLightboxZoom(0.92)
    else if (e.deltaY < 0)
      multiplyLightboxZoom(1.08)
    return
  }
  const dx = e.deltaX
  const dy = e.deltaY
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0)
      stepCertLightbox(1)
    else if (dx < 0)
      stepCertLightbox(-1)
  }
  else {
    if (dy > 0)
      stepCertLightbox(1)
    else if (dy < 0)
      stepCertLightbox(-1)
  }
}

watch(lightboxIndex, (idx, prevIdx) => {
  if (!import.meta.client)
    return
  document.documentElement.style.overflow = idx !== null ? 'hidden' : ''
  if (idx !== null && prevIdx == null)
    window.addEventListener('keydown', onCertLightboxKeydown)
  if (idx === null && prevIdx != null)
    window.removeEventListener('keydown', onCertLightboxKeydown)
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onCertLightboxKeydown)
    document.documentElement.style.overflow = ''
  }
})

const inScopeFilter = ref('')
const outScopeFilter = ref('')

const inScopeTableRows = computed<ScopeLineRow[]>(() =>
  (cert.value?.in_scope_lines ?? []).map((raw, i) => ({
    id: i,
    metin: stripHtml(raw) || '—',
  })),
)

const outOfScopeTableRows = computed<ScopeLineRow[]>(() =>
  (cert.value?.out_of_scope_lines ?? []).map((raw, i) => ({
    id: i,
    metin: stripHtml(raw) || '—',
  })),
)

const scopeLineColumns: TableColumn<ScopeLineRow>[] = [
  {
    accessorKey: 'metin',
    header: 'Ürün / kapsam',
    meta: { class: { td: 'align-top' } },
  },
]

const alertKind = computed(() => {
  if (!cert.value)
    return null
  return getCertAlertKind(cert.value)
})

const pageShellClass = computed(() => {
  if (!cert.value || missing.value)
    return ''
  return certDetailPageShellClass(alertKind.value)
})

const scopeInAccent = computed(() => {
  const k = alertKind.value
  return k === 'cancelled' || k === 'suspended' || k === 'expired' ? 'red' : 'emerald'
})

const markaSectionAccent = computed(() => {
  const k = alertKind.value
  return k === 'cancelled' || k === 'suspended' || k === 'expired' ? 'red' : 'primary'
})

onMounted(() => {
  const id = sertifikaId.value
  const raw = id ? sessionStorage.getItem(`gimdes_cert_${id}`) : null
  if (!raw) {
    missing.value = true
    return
  }
  try {
    cert.value = JSON.parse(raw) as Certificate
  }
  catch {
    missing.value = true
  }
})
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6" :class="pageShellClass">
    <template v-if="cert && !missing">
      <UAlert
        v-if="alertKind === 'cancelled'"
        color="error"
        variant="subtle"
        title="Bu sertifika iptal edilmiştir."
        :description="cert.IptalAciklamasi?.trim() || 'Geçerli helal sertifikası olarak kullanılmamalıdır.'"
      />
      <UAlert
        v-else-if="alertKind === 'suspended'"
        color="error"
        variant="subtle"
        title="Bu sertifika askıya alınmıştır."
        :description="cert.AskiyaAlmaAciklama?.trim() || cert.Durum?.trim() || 'Geçerli helal sertifikası olarak kullanılmamalıdır.'"
      />
      <UAlert
        v-else-if="alertKind === 'expired'"
        color="warning"
        variant="subtle"
        title="Bu sertifikanın süresi dolmuştur."
        description="Bitiş tarihi geçmiş; güncel durum için firmayı doğrulamanız önerilir."
      />
    </template>

    <UBreadcrumb
      :items="[
        { label: homeCrumbLabel, to: homeTo },
        { label: 'Marka' },
      ]"
      class="mb-2"
    />

    <UAlert
      v-if="missing"
      color="warning"
      variant="subtle"
      title="Kayıt bulunamadı veya oturum verisi eksik."
      description="Lütfen ana sayfadan tekrar bir marka seçin."
    >
      <template #actions>
        <UButton :to="homeTo" label="Ana sayfa" size="sm" />
      </template>
    </UAlert>

    <template v-else-if="cert">
      <GimdesDetailSection title="Marka" :accent="markaSectionAccent">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            class="border-default flex size-24 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br from-elevated to-default p-2 shadow-inner ring-1 ring-inset ring-default/50"
          >
            <img
              v-if="logo"
              :src="logo"
              :alt="cert.MarkaAdi"
              class="max-h-full max-w-full object-contain"
            >
            <UIcon v-else name="i-lucide-award" class="text-muted size-12 shrink-0" />
          </div>
          <div>
            <h1 class="text-highlighted text-2xl font-bold tracking-tight">
              {{ cert.MarkaAdi }}
            </h1>
            <p class="text-muted mt-1 text-sm">
              {{ cert.KategoriAdi }} · {{ cert.Durum }}
            </p>
            <p v-if="cert.SertifikaNo" class="mt-3 text-sm">
              Sertifika no: <span class="text-highlighted font-medium">{{ cert.SertifikaNo }}</span>
            </p>
          </div>
        </div>
      </GimdesDetailSection>


      <GimdesDetailSection
        v-if="cert.in_scope_lines?.length"
        title="Kapsam"
        :accent="scopeInAccent"
      >
        <div class="space-y-3">
          <UInput
            v-model="inScopeFilter"
            icon="i-lucide-search"
            placeholder="Tabloda ara…"
            clearable
            class="w-full max-w-md"
          />
          <div class="overflow-x-auto rounded-lg border border-default">
            <UTable
              v-model:global-filter="inScopeFilter"
              :global-filter-options="{ globalFilterFn: tableGlobalFilterTr }"
              :data="inScopeTableRows"
              :columns="scopeLineColumns"
              :get-row-id="row => String(row.id)"
              sticky="header"
              class="min-w-full text-base"
              :ui="{
                td: 'text-base text-default whitespace-normal leading-relaxed font-medium',
                th: 'text-base',
              }"
            />
          </div>
        </div>
      </GimdesDetailSection>

      <GimdesDetailSection
        v-if="cert.out_of_scope_lines?.length"
        title="Kapsam dışı"
        accent="red"
      >
        <div class="space-y-3">
          <UInput
            v-model="outScopeFilter"
            icon="i-lucide-search"
            placeholder="Tabloda ara…"
            clearable
            class="w-full max-w-md"
          />
          <div class="overflow-x-auto rounded-lg border border-default">
            <UTable
              v-model:global-filter="outScopeFilter"
              :global-filter-options="{ globalFilterFn: tableGlobalFilterTr }"
              :data="outOfScopeTableRows"
              :columns="scopeLineColumns"
              :get-row-id="row => String(row.id)"
              sticky="header"
              class="min-w-full text-base"
              :ui="{
                td: 'text-base text-default whitespace-normal leading-relaxed font-medium',
                th: 'text-base',
              }"
            />
          </div>
        </div>
      </GimdesDetailSection>

      <GimdesDetailSection title="Firma" accent="sky">
        <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-x-4">
          <dt class="text-muted">
            Ünvan
          </dt>
          <dd>{{ cert.FirmaAdi }}</dd>
          <dt class="text-muted">
            Adres
          </dt>
          <dd>{{ cert.FirmaAdresi }}</dd>
          <dt class="text-muted">
            İl / ülke
          </dt>
          <dd>{{ cert.FirmaIl }} / {{ cert.FirmaUlke }}</dd>
          <dt class="text-muted">
            Telefon
          </dt>
          <dd>{{ cert.FirmaTelefon }}</dd>
          <dt class="text-muted">
            E-posta
          </dt>
          <dd>{{ cert.FirmaIletisimEmail }}</dd>
          <dt class="text-muted">
            Web
          </dt>
          <dd>
            <a
              v-if="cert.FirmaWebSayfasi"
              :href="cert.FirmaWebSayfasi"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:underline"
            >{{ cert.FirmaWebSayfasi }}</a>
            <span v-else>—</span>
          </dd>
          <dt class="text-muted">
            İşletme kayıt no
          </dt>
          <dd>{{ cert.IsletmeKayitNo || '—' }}</dd>
        </dl>
      </GimdesDetailSection>

      <GimdesDetailSection title="Sertifika" accent="violet">
        <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-x-4">
          <dt class="text-muted">
            İlk alım
          </dt>
          <dd>{{ cert.IlkSertifikaAlimTarihi }}</dd>
          <dt class="text-muted">
            Bitiş
          </dt>
          <dd>{{ cert.SertifikaBitisTarihi }}</dd>
          <dt class="text-muted">
            Güncelleme
          </dt>
          <dd>{{ cert.GuncellemeTarihi }}</dd>
          <dt class="text-muted">
            Barkodlu ürün
          </dt>
          <dd>{{ cert.BarkodluUrunSayisi }}</dd>
          <template v-if="cert.IptalAciklamasi?.trim()">
            <dt class="text-muted">
              İptal açıklaması
            </dt>
            <dd class="whitespace-pre-wrap text-red-600 dark:text-red-400">
              {{ cert.IptalAciklamasi.trim() }}
            </dd>
          </template>
          <template v-if="cert.AskiyaAlmaAciklama?.trim()">
            <dt class="text-muted">
              Askı açıklaması
            </dt>
            <dd class="whitespace-pre-wrap text-red-600 dark:text-red-400">
              {{ cert.AskiyaAlmaAciklama.trim() }}
            </dd>
          </template>
        </dl>
      </GimdesDetailSection>

      <GimdesDetailSection
        v-if="certImages.length"
        title="Sertifika resimleri"
        accent="amber"
      >
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(img, idx) in certImages"
            :key="`${img.filename}-${idx}`"
            type="button"
            class="border-default size-24 shrink-0 overflow-hidden rounded-lg border bg-default/20 ring-default/40 transition hover:opacity-90 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            @click="openCertLightbox(idx)"
          >
            <img
              :src="certificateThumbSrc(idx)"
              :alt="cert.MarkaAdi"
              class="size-full object-cover"
              loading="lazy"
            />
          </button>
        </div>
      </GimdesDetailSection>

    </template>
  </div>

  <Teleport to="body">
    <div
      v-if="lightboxUrl"
      class="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Sertifika görseli"
      tabindex="-1"
      @wheel.prevent="onCertLightboxWheel"
    >
      <!-- Tam ekran tıklama alanı: üst katman pointer-events-none olduğu için boş alan tıkları buraya düşer -->
      <div
        class="absolute inset-0 bg-black/80"
        aria-hidden="true"
        @click="closeCertLightbox"
      />

      <div class="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
        <button
          type="button"
          class="pointer-events-auto absolute right-3 top-3 z-20 flex size-11 items-center justify-center rounded-full bg-default/90 text-default shadow-lg ring-1 ring-default/60 backdrop-blur-sm transition hover:bg-elevated focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2"
          aria-label="Kapat"
          @click="closeCertLightbox"
        >
          <UIcon name="i-lucide-x" class="size-6" />
        </button>

        <button
          v-if="lightboxHasMultiple"
          type="button"
          class="pointer-events-auto absolute left-2 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-default/90 text-default shadow-lg ring-1 ring-default/60 backdrop-blur-sm transition hover:bg-elevated focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2 sm:left-4"
          aria-label="Önceki görsel"
          @click="stepCertLightbox(-1)"
        >
          <UIcon name="i-lucide-chevron-left" class="size-7" />
        </button>
        <button
          v-if="lightboxHasMultiple"
          type="button"
          class="pointer-events-auto absolute right-2 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-default/90 text-default shadow-lg ring-1 ring-default/60 backdrop-blur-sm transition hover:bg-elevated focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2 sm:right-4"
          aria-label="Sonraki görsel"
          @click="stepCertLightbox(1)"
        >
          <UIcon name="i-lucide-chevron-right" class="size-7" />
        </button>

        <div
          class="pointer-events-auto relative flex h-[min(88vh,900px)] w-[min(96vw,1100px)] max-w-full items-center justify-center overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
          @click="closeCertLightbox"
        >
          <img
            :src="lightboxUrl"
            :alt="cert?.MarkaAdi ?? 'Sertifika görseli'"
            :style="{ transform: `scale(${lightboxZoom})` }"
            class="max-h-full max-w-full origin-center object-contain transition-transform duration-200 ease-out"
            @click.stop
          />
        </div>

        <div
          class="pointer-events-auto absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/55 px-2 py-1.5 text-white shadow-lg backdrop-blur-md sm:gap-2 sm:px-3"
        >
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
            aria-label="Küçült"
            @click="bumpLightboxZoom(-0.25)"
          >
            <UIcon name="i-lucide-minus" class="size-5" />
          </button>
          <span class="min-w-[3.25rem] text-center text-xs font-medium tabular-nums sm:text-sm">
            {{ Math.round(lightboxZoom * 100) }}%
          </span>
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
            aria-label="Büyült"
            @click="bumpLightboxZoom(0.25)"
          >
            <UIcon name="i-lucide-plus" class="size-5" />
          </button>
          <button
            type="button"
            class="ml-1 flex size-9 items-center justify-center rounded-full transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none sm:ml-2"
            aria-label="Zoom sıfırla"
            title="Sıfırla (0)"
            @click="resetLightboxZoom"
          >
            <UIcon name="i-lucide-rotate-ccw" class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
