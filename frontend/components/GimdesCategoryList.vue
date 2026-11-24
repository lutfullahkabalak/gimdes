<script setup lang="ts">
import { textIncludesTr } from '~/utils/matchScope'

export type CategoryItem = {
  id: string
  name: string
  /** İki dilli özgün ad; arama ve ipucu için */
  fullName: string
  count: number | null
  icon: string
  group: 'recent' | 'status' | 'product'
}

const props = defineProps<{
  items: CategoryItem[]
  selectedId: string
  loading: boolean
  error: string
}>()

defineEmits<{ select: [id: string], retry: [] }>()

const filter = ref('')
const groups = computed(() =>
  ([
    ['recent', ''],
    ['product', 'Ürün grupları'],
    ['status', 'Geçerli olmayanlar'],
  ] as const)
    .map(([key, title]) => ({
      key,
      title,
      items: props.items.filter(i => i.group === key && textIncludesTr(filter.value, i.fullName)),
    }))
    .filter(g => g.items.length),
)
</script>

<template>
  <div class="space-y-3">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Kategoriler yüklenemedi"
      :description="error"
      :actions="[{ label: 'Tekrar dene', color: 'error', variant: 'soft', onClick: () => $emit('retry') }]"
    />
    <div v-if="loading" class="space-y-2" role="status" aria-label="Kategoriler yükleniyor">
      <USkeleton v-for="n in 8" :key="n" class="h-10 rounded-lg" />
    </div>
    <template v-else>
      <UInput
        v-model="filter"
        icon="i-lucide-search"
        placeholder="Kategori bul"
        aria-label="Kategori bul"
        size="lg"
        class="w-full"
      />
      <nav class="space-y-4" aria-label="Kategori seçimi">
        <div v-for="group in groups" :key="group.key">
          <h3 v-if="group.title" class="text-muted px-3 pb-1 text-sm font-semibold">
            {{ group.title }}
          </h3>
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-[0.9375rem] gimdes-press leading-snug focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary lg:min-h-10"
            :class="selectedId === item.id ? 'bg-emerald-100 font-semibold text-ink-900' : 'hover:bg-paper'"
            :aria-pressed="selectedId === item.id"
            :title="item.fullName"
            @click="$emit('select', item.id)"
          >
            <UIcon :name="item.icon" class="size-5 shrink-0" :class="selectedId === item.id ? 'text-primary' : 'text-muted'" aria-hidden="true" />
            <span class="min-w-0 flex-1 wrap-anywhere">{{ item.name }}</span>
            <span v-if="item.count !== null" class="text-muted text-sm font-normal tabular-nums">{{ item.count }}</span>
          </button>
        </div>
        <p v-if="!groups.length && !error" class="text-muted px-3 py-4 text-sm">
          “{{ filter }}” ile eşleşen kategori yok.
        </p>
      </nav>
    </template>
  </div>
</template>
