<script setup lang="ts">
import type { CategoryItem } from '~/components/GimdesCategoryList.vue'
import { categoryColor } from '~/utils/categoryPalette'

defineProps<{ items: CategoryItem[], selectedId: string, loading: boolean }>()
defineEmits<{ select: [id: string], all: [] }>()

const track = ref<HTMLElement | null>(null)
function slide(dir: number) {
  const el = track.value
  el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
}
</script>

<template>
  <section aria-label="Kategoriler">
    <div class="mb-4 flex items-end justify-between gap-3">
      <h2 class="font-display text-highlighted text-2xl font-extrabold sm:text-3xl">
        Reyonlar
      </h2>
      <div class="flex items-center gap-2">
        <button type="button" class="gimdes-focus gimdes-press hidden size-11 cursor-pointer items-center justify-center rounded-full bg-ink-900 text-white hover:bg-ink-700 sm:flex" aria-label="Önceki reyonlar" @click="slide(-1)">
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </button>
        <button type="button" class="gimdes-focus gimdes-press hidden size-11 cursor-pointer items-center justify-center rounded-full bg-ink-900 text-white hover:bg-ink-700 sm:flex" aria-label="Sonraki reyonlar" @click="slide(1)">
          <UIcon name="i-lucide-arrow-right" class="size-5" />
        </button>
        <button type="button" class="gimdes-focus gimdes-press h-11 cursor-pointer rounded-full border-2 border-ink-900 px-4 font-bold text-ink-900 hover:bg-ink-900 hover:text-white" @click="$emit('all')">
          Tümü
        </button>
      </div>
    </div>
    <div ref="track" class="gimdes-shelf gimdes-bleed grid auto-cols-[9.25rem] grid-flow-col grid-rows-2 gap-3 overflow-x-auto py-2 sm:auto-cols-[11rem]">
      <template v-if="loading">
        <div v-for="n in 16" :key="n" class="h-32 animate-pulse rounded-3xl bg-slate-100" />
      </template>
      <button
        v-for="(item, i) in items"
        v-else
        :key="item.id"
        type="button"
        class="gimdes-stagger gimdes-focus gimdes-press group relative flex h-32 cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-3.5 text-left text-ink-900 hover:-translate-y-1 hover:rotate-[-1.5deg]"
        :style="{ '--i': Math.min(i, 11), 'backgroundColor': selectedId === item.id ? '#06261a' : item.group === 'recent' ? '#ffffff' : categoryColor(item.fullName) }"
        :class="[selectedId === item.id ? 'text-white!' : '', item.group === 'recent' ? 'ring-2 ring-ink-900 ring-inset' : '']"
        :aria-pressed="selectedId === item.id"
        :title="item.fullName"
        @click="$emit('select', item.id)"
      >
        <UIcon
          :name="item.icon"
          class="absolute -right-4 -bottom-5 size-24 opacity-25 transition-transform duration-500 ease-soft group-hover:scale-110 group-hover:-rotate-12"
          aria-hidden="true"
        />
        <span class="relative line-clamp-3 leading-tight font-bold">{{ item.name }}</span>
        <span v-if="item.count !== null" class="font-display relative text-2xl leading-none font-extrabold tabular-nums">{{ item.count }}</span>
      </button>
    </div>
  </section>
</template>
