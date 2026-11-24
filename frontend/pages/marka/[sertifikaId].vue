<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { categoryNameTr, certStatusDisplay, formatCertDate, websiteHref } from '~/utils/certDisplay'
import { getCertAlertKind, hasHistoricalSuspensionNote } from '~/utils/certStatus'
import { categoryColor, NO_COLOR } from '~/utils/categoryPalette'
import { certificateThumbSrc, listCertificateImages } from '~/utils/certImages'
import { stripHtml, textIncludesTr } from '~/utils/matchScope'

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

const scopeFilter = ref('')

function scopeGroup(raw: string[] | undefined) {
  const all = (raw ?? []).map(line => stripHtml(line) || '—')
  const visible = all.filter(line => textIncludesTr(scopeFilter.value, line))
  const count = visible.length === all.length ? `${all.length} kayıt` : `${visible.length} / ${all.length} kayıt`
  return { all, visible, count }
}

const inScope = computed(() => scopeGroup(cert.value?.in_scope_lines))
const outOfScope = computed(() => scopeGroup(cert.value?.out_of_scope_lines))

const status = computed(() => cert.value ? certStatusDisplay(cert.value) : null)
const statusClass = computed(() => ({
  success: 'bg-[#c9f7df] text-ink-900',
  warning: 'bg-[#8a4300] text-white',
  error: 'bg-danger text-white',
  neutral: 'bg-paper text-ink-900',
})[status.value?.tone ?? 'neutral'])

const endDate = computed(() => formatCertDate(cert.value?.SertifikaBitisTarihi))

const statusText = computed(() => {
  const c = cert.value
  if (!c)
    return ''
  if (alertKind.value === 'cancelled')
    return stripHtml(c.IptalAciklamasi) || 'Geçerli helal sertifikası olarak kullanılmamalıdır.'
  if (alertKind.value === 'suspended')
    return stripHtml(c.AskiyaAlmaAciklama) || 'Geçerli helal sertifikası olarak kullanılmamalıdır.'
  if (alertKind.value === 'expired')
    return `${endDate.value ? `Bitiş tarihi: ${endDate.value}. ` : ''}Güncel durumu firmadan veya GİMDES’ten doğrulamanız önerilir.`
  if (status.value?.tone === 'success')
    return endDate.value ? `Bitiş tarihi: ${endDate.value}.` : ''
  return endDate.value ? `Bitiş tarihi: ${endDate.value}. Güncel durum için GİMDES’e danışın.` : 'Güncel durum için GİMDES’e danışın.'
})

const statusTitle = computed(() => {
  if (alertKind.value === 'cancelled')
    return 'Bu sertifika iptal edilmiştir'
  if (alertKind.value === 'suspended')
    return 'Bu sertifika askıya alınmıştır'
  if (alertKind.value === 'expired' && status.value?.label === 'Süresi geçmiş')
    return 'Bu sertifikanın süresi dolmuştur'
  return status.value?.tone === 'success' ? 'Sertifika geçerli' : status.value?.label ?? ''
})

const website = computed(() => websiteHref(cert.value?.FirmaWebSayfasi))
const location = computed(() => [cert.value?.FirmaIl, cert.value?.FirmaUlke].filter(Boolean).join(' / '))
const phoneHref = computed(() => {
  const digits = (cert.value?.FirmaTelefon ?? '').replace(/[^\d+]/g, '')
  return digits.length >= 7 ? `tel:${digits}` : null
})

const certFacts = computed(() => {
  const c = cert.value
  if (!c)
    return []
  return [
    ['Sertifika no', c.SertifikaNo],
    ['İlk alım', formatCertDate(c.IlkSertifikaAlimTarihi)],
    ['Bitiş', endDate.value],
    ['Güncelleme', formatCertDate(c.GuncellemeTarihi)],
    ['Barkodlu ürün', c.BarkodluUrunSayisi],
    ['İşletme kayıt no', c.IsletmeKayitNo],
  ].map(([label, value]) => ({ label: String(label), value: value === null || value === undefined || value === '' ? 'Belirtilmemiş' : String(value) }))
})

const alertKind = computed(() => {
  if (!cert.value)
    return null
  return getCertAlertKind(cert.value)
})

const showHistoricalSuspensionNote = computed(() => {
  if (!cert.value)
    return false
  return hasHistoricalSuspensionNote(cert.value)
})

const pageColor = computed(() => {
  if (!cert.value)
    return '#1fd37e'
  return alertKind.value ? NO_COLOR : categoryColor(cert.value.KategoriAdi)
})
const rosetteColors = computed(() => alertKind.value
  ? ['#b9c1bd', '#a9b2ad', '#c8cfcb']
  : ['#ffffff', '#06261a', '#ffffff', '#2c4bff'])

const activeBrand = useState<number | null>('gimdes-active-brand', () => null)

function loadCert() {
  const id = sertifikaId.value
  let raw: string | null = null
  try {
    raw = id ? sessionStorage.getItem(`gimdes_cert_${id}`) : null
    if (raw) {
      cert.value = JSON.parse(raw) as Certificate
      activeBrand.value = cert.value.SertifikaId
    }
    else {
      missing.value = true
    }
  }
  catch {
    missing.value = true
  }
}

// Uygulama içi geçişte kayıt hemen okunur ki logo kartından buraya taşınabilsin.
if (import.meta.client && !useNuxtApp().isHydrating)
  loadCert()
else
  onMounted(loadCert)
</script>

<template>
  <div class="mx-auto max-w-6xl pt-8">
    <GimdesSiteHeader :color="pageColor">
      <UButton to="/arama" icon="i-lucide-search" label="Ürün ara" color="neutral" size="lg" class="gimdes-press rounded-full px-5 font-bold" />
    </GimdesSiteHeader>

    <UBreadcrumb v-if="missing" :items="[{ label: homeCrumbLabel, to: homeTo }, { label: 'Marka' }]" class="mb-4 pt-8" />

    <UAlert
      v-if="missing"
      color="warning"
      variant="subtle"
      title="Kayıt bulunamadı veya oturum verisi eksik."
      description="Lütfen ana sayfadan tekrar bir marka seçin."
    >
      <template #actions>
        <UButton :to="homeTo" :label="homeCrumbLabel" size="sm" />
      </template>
    </UAlert>

    <template v-else-if="cert">
      <section class="gimdes-bleed relative -mt-px mb-6 overflow-hidden text-ink-900 lg:mb-8" :style="{ backgroundColor: pageColor }">
        <GimdesRosette
          :seed="`${cert.SertifikaNo || ''}-${cert.SertifikaId}`"
          :colors="rosetteColors"
          class="gimdes-bloom absolute -right-28 -bottom-32 w-96 opacity-80 lg:top-1/2 lg:right-0 lg:bottom-auto lg:w-[36rem] lg:-translate-y-1/2"
        />
        <div class="relative pt-6 pb-8 lg:pt-8 lg:pb-12">
          <UBreadcrumb
            :items="[
              { label: homeCrumbLabel, to: homeTo },
              { label: cert.MarkaAdi || 'Marka' },
            ]"
            class="mb-5"
            :ui="{ link: 'text-ink-900 hover:text-ink-900 font-semibold', separatorIcon: 'text-ink-900' }"
          />
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8 lg:pr-80">
            <GimdesBrandLogo :cert="cert" class="size-32 shrink-0 rounded-[1.75rem] p-4 shadow-[0_18px_40px_-16px_rgb(6_38_26/0.45)] sm:size-48" />
            <div class="animate-rise min-w-0">
              <p class="font-bold" :title="cert.KategoriAdi">
                {{ categoryNameTr(cert.KategoriAdi) }}
              </p>
              <h1 class="font-display mt-1 text-4xl leading-[0.95] font-extrabold tracking-[-0.03em] text-balance wrap-anywhere sm:text-5xl xl:text-6xl">
                {{ cert.MarkaAdi }}
              </h1>
              <p class="mt-3 font-medium wrap-anywhere">
                {{ cert.FirmaAdi }}
              </p>
            </div>
          </div>
        </div>
        <div v-if="status" class="gimdes-stamp pointer-events-none absolute top-16 right-5 w-28 rotate-[10deg] sm:top-auto sm:right-8 sm:bottom-8 sm:w-40 lg:right-[max(3rem,calc(50vw-32rem))] lg:bottom-auto lg:top-1/2 lg:w-56 lg:-translate-y-1/2">
          <GimdesSeal :cert="cert" />
        </div>
      </section>

      <div
        v-if="status"
        class="animate-rise mb-5 flex items-start gap-4 rounded-3xl px-5 py-4 [animation-delay:120ms] sm:px-6 lg:mb-6"
        :class="statusClass"
        :role="alertKind ? 'alert' : 'status'"
      >
        <UIcon :name="status.icon" class="mt-0.5 size-7 shrink-0" aria-hidden="true" />
        <div class="min-w-0">
          <p class="font-display text-xl font-extrabold">
            {{ statusTitle }}
          </p>
          <p v-if="statusText" class="whitespace-pre-wrap wrap-anywhere">
            {{ statusText }}
          </p>
        </div>
      </div>

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-6">
        <div class="animate-appear min-w-0 space-y-4 [animation-delay:80ms]">
          <UInput
            v-if="inScope.all.length || outOfScope.all.length"
            v-model="scopeFilter"
            icon="i-lucide-search"
            size="xl"
            placeholder="Bu sertifikada ürün ara"
            aria-label="Kapsam ve kapsam dışı ürünlerde ara"
            class="sticky top-[calc(4.5rem+env(safe-area-inset-top))] z-10 w-full"
            :ui="{ base: 'h-14 rounded-full bg-white text-lg ps-13 ring-2 ring-ink-900', leading: 'ps-5', trailing: 'pe-1.5' }"
          >
            <template v-if="scopeFilter" #trailing>
              <UButton icon="i-lucide-x" color="neutral" variant="ghost" aria-label="Ürün aramasını temizle" @click="scopeFilter = ''" />
            </template>
          </UInput>

          <GimdesDetailSection v-if="inScope.all.length" title="Kapsamdaki ürünler" :count="inScope.count">
            <p v-if="alertKind" class="text-sm font-semibold text-red-700">
              Sertifika geçerli olmadığı için bu liste güncel onay anlamına gelmez.
            </p>
            <GimdesScopeList :lines="inScope.visible" :inactive="alertKind !== null" />
            <p v-if="!inScope.visible.length" class="text-muted py-3">
              “{{ scopeFilter }}” kapsamda yok.
            </p>
          </GimdesDetailSection>

          <GimdesDetailSection v-if="outOfScope.all.length" title="Kapsam dışı ürünler" :count="outOfScope.count">
            <GimdesScopeList :lines="outOfScope.visible" outside />
            <p v-if="!outOfScope.visible.length" class="text-muted py-3">
              “{{ scopeFilter }}” kapsam dışı listesinde yok.
            </p>
          </GimdesDetailSection>

          <p v-if="!inScope.all.length && !outOfScope.all.length" class="gimdes-surface text-muted p-5">
            Bu kayıtta ürün kapsamı belirtilmemiş.
          </p>
        </div>

        <div class="animate-rise min-w-0 space-y-4 [animation-delay:140ms]">
          <GimdesDetailSection v-if="certImages.length" title="Sertifika belgesi" :count="`${certImages.length} görsel`">
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                v-for="(img, idx) in certImages"
                :key="`${img.filename}-${idx}`"
                type="button"
                class="gimdes-focus h-28 w-20 shrink-0 gimdes-press cursor-zoom-in overflow-hidden rounded-lg border border-line hover:-translate-y-0.5 hover:border-ink-900 hover:rotate-2 hover:shadow-lg"
                :aria-label="`${idx + 1}. sertifika görselini büyüt`"
                @click="openCertLightbox(idx)"
              >
                <img
                  :src="certificateThumbSrc(idx)"
                  alt=""
                  class="size-full object-cover"
                  loading="lazy"
                >
              </button>
            </div>
          </GimdesDetailSection>

          <GimdesDetailSection title="Sertifika bilgileri">
            <dl class="divide-y divide-line">
              <div v-for="fact in certFacts" :key="fact.label" class="flex justify-between gap-4 py-2.5">
                <dt class="text-muted shrink-0">
                  {{ fact.label }}
                </dt>
                <dd class="min-w-0 text-right font-semibold tabular-nums wrap-anywhere" :class="fact.value === 'Belirtilmemiş' ? 'text-muted font-normal' : 'text-highlighted'">
                  {{ fact.value }}
                </dd>
              </div>
            </dl>
            <div v-if="showHistoricalSuspensionNote && stripHtml(cert.AskiyaAlmaAciklama)" class="mt-3 rounded-lg bg-paper p-3 text-sm">
              <p class="font-semibold">
                Geçmiş askı kaydı
              </p>
              <p class="text-muted mt-1 whitespace-pre-wrap wrap-anywhere">
                {{ stripHtml(cert.AskiyaAlmaAciklama) }}
              </p>
            </div>
          </GimdesDetailSection>

          <GimdesDetailSection title="Firma">
            <p class="text-highlighted font-semibold wrap-anywhere">
              {{ cert.FirmaAdi }}
            </p>
            <p v-if="cert.FirmaAdresi" class="text-muted mt-1 wrap-anywhere">
              {{ cert.FirmaAdresi }}
            </p>
            <p v-if="location" class="text-muted">
              {{ location }}
            </p>
            <ul class="mt-3 space-y-1">
              <li v-if="cert.FirmaTelefon" class="flex items-center gap-3 py-1">
                <UIcon name="i-lucide-phone" class="text-muted size-4 shrink-0" aria-label="Telefon" />
                <a v-if="phoneHref" :href="phoneHref" class="gimdes-focus text-primary hover:underline">{{ cert.FirmaTelefon }}</a>
                <span v-else>{{ cert.FirmaTelefon }}</span>
              </li>
              <li v-if="cert.FirmaIletisimEmail" class="flex items-center gap-3 py-1">
                <UIcon name="i-lucide-mail" class="text-muted size-4 shrink-0" aria-label="E-posta" />
                <a :href="`mailto:${cert.FirmaIletisimEmail}`" class="gimdes-focus text-primary min-w-0 wrap-anywhere hover:underline">{{ cert.FirmaIletisimEmail }}</a>
              </li>
              <li v-if="cert.FirmaWebSayfasi" class="flex items-center gap-3 py-1">
                <UIcon name="i-lucide-globe" class="text-muted size-4 shrink-0" aria-label="Web sitesi" />
                <a v-if="website" :href="website" target="_blank" rel="noopener noreferrer" class="gimdes-focus text-primary min-w-0 wrap-anywhere hover:underline">{{ cert.FirmaWebSayfasi }}</a>
                <span v-else class="min-w-0 wrap-anywhere">{{ cert.FirmaWebSayfasi }}</span>
              </li>
            </ul>
          </GimdesDetailSection>
        </div>
      </div>
    </template>
  </div>

  <Teleport to="body">
    <Transition name="lightbox">
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
            class="lightbox-frame pointer-events-auto relative flex h-[min(88vh,900px)] w-[min(96vw,1100px)] max-w-full items-center justify-center overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
            @click="closeCertLightbox"
          >
            <img
              :key="lightboxUrl"
              :src="lightboxUrl"
              :alt="cert?.MarkaAdi ?? 'Sertifika görseli'"
              :style="{ transform: `scale(${lightboxZoom})` }"
              class="max-h-full animate-appear max-w-full origin-center object-contain transition-transform duration-300 ease-soft"
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
    </Transition>
  </Teleport>
</template>
