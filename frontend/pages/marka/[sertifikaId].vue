<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Certificate } from '~/types/gimdes'
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
  <div class="mx-auto max-w-3xl space-y-6">
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
      <UCard
        :ui="{
          header:
            'border-default border-b bg-primary/15 px-4 py-3.5 sm:px-6',
        }"
      >
        <template #header>
          <h2 class="text-highlighted font-semibold">
            Marka
          </h2>
        </template>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
          <img
            v-if="logo"
            :src="logo"
            :alt="cert.MarkaAdi"
            class="border-default size-24 shrink-0 rounded-xl border object-contain"
          >
          <UIcon v-else name="i-lucide-award" class="text-muted size-24 shrink-0" />
          <div>
            <h1 class="text-highlighted text-2xl font-bold">
              {{ cert.MarkaAdi }}
            </h1>
            <p class="text-muted mt-1">
              {{ cert.KategoriAdi }} · {{ cert.Durum }}
            </p>
            <p v-if="cert.SertifikaNo" class="mt-2 text-sm">
              Sertifika no: <span class="font-medium">{{ cert.SertifikaNo }}</span>
            </p>
          </div>
        </div>
      </UCard>

      <UCard
        :ui="{
          header:
            'border-default border-b bg-sky-500/15 px-4 py-3.5 sm:px-6 text-sky-950 dark:text-sky-100',
        }"
      >
        <template #header>
          <h2 class="font-semibold">
            Firma
          </h2>
        </template>
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
      </UCard>

      <UCard
        :ui="{
          header:
            'border-default border-b bg-violet-500/15 px-4 py-3.5 sm:px-6 text-violet-950 dark:text-violet-100',
        }"
      >
        <template #header>
          <h2 class="font-semibold">
            Sertifika
          </h2>
        </template>
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
        </dl>
      </UCard>

      <UCard
        v-if="cert.in_scope_lines?.length"
        :ui="{
          header:
            'border-default border-b bg-emerald-500/15 px-4 py-3.5 sm:px-6 text-emerald-950 dark:text-emerald-100',
        }"
      >
        <template #header>
          <h2 class="font-semibold">
            Kapsam
          </h2>
        </template>
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
      </UCard>

      <UCard
        v-if="cert.out_of_scope_lines?.length"
        :ui="{
          header:
            'border-default border-b bg-amber-500/15 px-4 py-3.5 sm:px-6 text-amber-950 dark:text-amber-100',
        }"
      >
        <template #header>
          <h2 class="font-semibold">
            Kapsam dışı
          </h2>
        </template>
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
      </UCard>
    </template>
  </div>
</template>
