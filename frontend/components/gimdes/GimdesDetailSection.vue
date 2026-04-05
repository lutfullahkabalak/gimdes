<script setup lang="ts">
const props = defineProps<{
  title: string
  accent: 'primary' | 'sky' | 'violet' | 'emerald' | 'amber' | 'red'
}>()

const shell = computed(() => {
  const map = {
    primary: 'border-l-primary',
    sky: 'border-l-sky-500',
    violet: 'border-l-violet-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
  } as const
  return map[props.accent]
})

const header = computed(() => {
  const map = {
    primary: 'bg-primary/12',
    sky: 'bg-sky-500/12 text-sky-950 dark:text-sky-100',
    violet: 'bg-violet-500/12 text-violet-950 dark:text-violet-100',
    emerald: 'bg-emerald-500/12 text-emerald-950 dark:text-emerald-100',
    amber: 'bg-amber-500/12 text-amber-950 dark:text-amber-100',
    red: 'bg-red-500/12 text-red-950 dark:text-red-100',
  } as const
  return map[props.accent]
})
</script>

<template>
  <section
    class="gimdes-surface overflow-hidden border-l-4 bg-gradient-to-br from-default to-elevated/20"
    :class="shell"
  >
    <div
      class="border-b border-default/60 px-4 py-3.5 sm:px-6"
      :class="header"
    >
      <h2
        class="font-semibold tracking-tight"
        :class="accent === 'primary' ? 'text-highlighted' : ''"
      >
        {{ title }}
      </h2>
    </div>
    <div class="p-4 sm:p-6">
      <slot />
    </div>
  </section>
</template>
