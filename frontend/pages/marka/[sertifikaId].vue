<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Certificate } from '~/types/gimdes'
import { certDetailPageShellClass, getCertAlertKind } from '~/utils/certStatus'
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

const logo = computed(() => logoUrl(cert.value?.MarkaLogosu ?? null))

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

    </template>
  </div>
</template>
