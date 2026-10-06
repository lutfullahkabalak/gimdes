<script setup lang="ts">
defineProps<{
  items: { label: string; id: string; icon: string }[]
  selectedId: string
  loading: boolean
  error: string
}>()

defineEmits<{ select: [id: string] }>()
</script>

<template>
  <div class="space-y-3">
    <UAlert v-if="error" color="error" variant="subtle" :title="error" />
    <div v-if="loading" class="space-y-2" role="status" aria-label="Kategoriler yükleniyor">
      <USkeleton v-for="n in 6" :key="n" class="h-12 rounded-lg" />
    </div>
    <nav v-else class="flex flex-col gap-1" aria-label="Kategori seçimi">
      <UButton
        v-for="item in items"
        :key="item.id"
        :label="item.label"
        :icon="item.icon"
        :color="selectedId === item.id ? 'primary' : 'neutral'"
        :variant="selectedId === item.id ? 'soft' : 'ghost'"
        :aria-pressed="selectedId === item.id"
        size="lg"
        class="min-h-12 w-full justify-start"
        :ui="{ label: 'whitespace-normal text-left', leadingIcon: 'shrink-0' }"
        @click="$emit('select', item.id)"
      />
    </nav>
  </div>
</template>
