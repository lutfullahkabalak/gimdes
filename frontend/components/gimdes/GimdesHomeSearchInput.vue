<script setup lang="ts">
const query = defineModel<string>({ required: true })
withDefaults(defineProps<{ placeholder?: string, large?: boolean, loading?: boolean, clearable?: boolean }>(), {
  placeholder: 'Örn. piliç, süt, baharat…',
})
defineEmits<{ submit: [] }>()
</script>

<template>
  <UInput
    v-model="query"
    type="search"
    :placeholder="placeholder"
    autocomplete="off"
    enterkeyhint="search"
    size="xl"
    variant="outline"
    :ui="{
      base: `${large ? 'h-14 text-lg pl-13' : 'h-11 text-base pl-11'} rounded-lg bg-white pr-11 transition-shadow duration-300 ease-soft`,
      leading: `pointer-events-none ${large ? 'ps-4' : 'ps-3'}`,
      trailing: 'pe-1.5',
    }"
    class="w-full"
    @keydown.enter.prevent="$emit('submit')"
  >
    <template #leading>
      <UIcon name="i-lucide-search" class="text-muted shrink-0" :class="large ? 'size-6' : 'size-5'" aria-hidden="true" />
    </template>
    <template v-if="loading || (clearable && query)" #trailing>
      <UIcon v-if="loading" name="i-lucide-loader-circle" class="text-primary m-2 size-5 animate-spin" />
      <UButton v-else icon="i-lucide-x" color="neutral" variant="ghost" aria-label="Aramayı temizle" @click="query = ''" />
    </template>
  </UInput>
</template>
