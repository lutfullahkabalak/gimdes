<script setup lang="ts">
import { splitQueryHighlightSegments } from '~/utils/matchScope'

const props = defineProps<{
  text: string
  query: string
}>()

const segments = computed(() => splitQueryHighlightSegments(props.text, props.query))
</script>

<template>
  <span class="inline align-baseline">
    <template v-for="(seg, i) in segments" :key="i">
      <mark
        v-if="seg.highlight"
        class="rounded-[1px] bg-[#FFEB3B] px-0 text-inherit [box-decoration-break:clone] dark:bg-[#C9A227]/85"
      >
        {{ seg.text }}
      </mark>
      <template v-else>
        {{ seg.text }}
      </template>
    </template>
  </span>
</template>
