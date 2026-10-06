<script setup lang="ts">
const query = defineModel<string>({ required: true })
defineEmits<{ submit: [] }>()
</script>

<template>
  <UInput
    v-model="query"
    type="search"
    placeholder="Örn. piliç, süt, baharat…"
    autocomplete="off"
    size="xl"
    variant="outline"
    :ui="{
      base: 'h-12 rounded-[1.35rem] pl-[3.55rem] text-base shadow-sm sm:h-14 sm:rounded-[1.65rem] sm:pl-[3.85rem] sm:text-lg',
      leading: 'pointer-events-none ps-3.5',
    }"
    class="w-full"
    @keydown.enter.prevent="$emit('submit')"
  >
    <template #leading>
      <UIcon name="i-lucide-search" class="size-6 shrink-0 text-primary sm:size-7" aria-hidden="true" />
    </template>
  </UInput>
</template>
