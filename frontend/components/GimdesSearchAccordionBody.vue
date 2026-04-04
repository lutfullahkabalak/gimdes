<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Certificate } from '~/types/gimdes'
import { productLinesForAccordion, stripHtml, tableGlobalFilterTr } from '~/utils/matchScope'

type Row = { id: number; metin: string }

const props = defineProps<{
  q: string
  cert: Certificate
}>()

const lines = computed(() => productLinesForAccordion(props.q, props.cert))

const tableFilter = ref('')

const tableRows = computed<Row[]>(() =>
  lines.value.map((line, i) => ({
    id: i,
    metin: stripHtml(line) || '—',
  })),
)

const tableColumns: TableColumn<Row>[] = [
  {
    accessorKey: 'metin',
    header: 'Ürün / kapsam',
    meta: { class: { td: 'align-top' } },
  },
]
</script>

<template>
  <div class="border-default space-y-3 border-t p-4">
    <p class="text-muted text-xs font-semibold uppercase tracking-wide">
      Eşleşen ürün / kapsam
    </p>
    <template v-if="lines.length">
      <UInput
        v-model="tableFilter"
        icon="i-lucide-search"
        placeholder="Tabloda ara…"
        clearable
        class="w-full max-w-md"
        size="sm"
      />
      <div class="overflow-x-auto rounded-lg border border-default">
        <UTable
          v-model:global-filter="tableFilter"
          :global-filter-options="{ globalFilterFn: tableGlobalFilterTr }"
          :data="tableRows"
          :columns="tableColumns"
          :get-row-id="row => String(row.id)"
          sticky="header"
          class="min-w-full text-sm"
        />
      </div>
    </template>
    <p v-else class="text-muted text-sm">
      Aranan metin kapsam satırlarında listelenmiyor; detay sayfasından tam listeye bakabilirsiniz.
    </p>
  </div>
</template>
