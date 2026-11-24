<script setup lang="ts">
import type { Certificate } from '~/types/gimdes'
import { getCertAlertKind } from '~/utils/certStatus'
import { isOutOfScopeMatch, productLinesForAccordion, stripHtml, textIncludesTr } from '~/utils/matchScope'

const props = defineProps<{
  q: string
  cert: Certificate
}>()

const lines = computed(() => productLinesForAccordion(props.q, props.cert).map(l => stripHtml(l) || '—'))
const outside = computed(() => isOutOfScopeMatch(props.q, props.cert))
const filter = ref('')
const visible = computed(() => lines.value.filter(l => textIncludesTr(filter.value, l)))
</script>

<template>
  <div class="space-y-3 border-t border-line bg-paper px-3 py-4 sm:px-4">
    <template v-if="lines.length">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-sm font-semibold" :class="outside ? 'text-red-700' : 'text-highlighted'">
          {{ outside ? 'Bu ürünler sertifika kapsamı dışında' : 'Sertifika kapsamında eşleşenler' }}
        </p>
        <UInput
          v-if="lines.length > 5"
          v-model="filter"
          icon="i-lucide-search"
          placeholder="Listede ara"
          aria-label="Eşleşen ürünlerde ara"
          class="w-full sm:w-64"
        />
      </div>
      <GimdesScopeList :lines="visible" :outside="outside" :inactive="getCertAlertKind(cert) !== null" :query="q" />
      <p v-if="!visible.length" class="text-muted text-sm">
        “{{ filter }}” bu listede yok.
      </p>
    </template>
    <p v-else class="text-muted text-sm">
      Aranan metin kapsam satırlarında listelenmiyor; detay sayfasından tam listeye bakabilirsiniz.
    </p>
  </div>
</template>
