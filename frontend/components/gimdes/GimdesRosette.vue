<script setup lang="ts">
import { hashText } from '~/utils/categoryPalette'

/**
 * Canlı giyoş (guilloche) rozeti: sertifika kâğıtlarındaki örgülü desen.
 * Desen `seed` metninden üretilir; metin değişince yeni desene yumuşakça dönüşür.
 */
const props = withDefaults(defineProps<{
  seed: string
  colors: string[]
  lineWidth?: number
}>(), { lineWidth: 1.1 })

const canvas = ref<HTMLCanvasElement | null>(null)
const KS = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16]
const STRANDS = 9
const POINTS = 300

type Layer = { w: Float32Array, target: Float32Array, scale: number }
let layers: Layer[] = []
let raf = 0
let visible = false
let start = 0
let reduced = false
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null

function targetsFor(seed: string) {
  let h = hashText(seed || 'gimdes')
  const next = () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0
    return (h >>> 8) / 0x1000000
  }
  return props.colors.map(() => {
    const w = new Float32Array(KS.length)
    w[Math.floor(next() * KS.length)]! += 0.12 + next() * 0.16
    w[Math.floor(next() * KS.length)]! += 0.06 + next() * 0.12
    return w
  })
}

function retarget() {
  const targets = targetsFor(props.seed)
  const n = targets.length
  if (layers.length !== n) {
    layers = targets.map((t, i) => ({ w: Float32Array.from(t), target: t, scale: 0.98 - i * (0.68 / n) }))
  }
  else {
    targets.forEach((t, i) => { layers[i]!.target = t })
  }
  if (reduced) {
    layers.forEach(l => l.w.set(l.target))
    draw(0)
  }
}

function draw(time: number) {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx)
    return
  const { width, height } = el
  ctx.clearRect(0, 0, width, height)
  const R = Math.min(width, height) / 2 * 0.74
  const dpr = width / Math.max(1, el.clientWidth)
  ctx.lineWidth = props.lineWidth * dpr
  ctx.lineJoin = 'round'
  layers.forEach((layer, li) => {
    const active: number[] = []
    for (let k = 0; k < KS.length; k++) {
      layer.w[k]! += (layer.target[k]! - layer.w[k]!) * (reduced ? 1 : 0.07)
      if (layer.w[k]! > 0.004)
        active.push(k)
    }
    const spin = time * 0.00006 * (li % 2 ? -1 : 1) * (1 + li * 0.35)
    ctx.strokeStyle = props.colors[li]!
    for (let s = 0; s < STRANDS; s++) {
      const phase = (s / STRANDS) * Math.PI * 2 + time * 0.00025 * (li % 2 ? 1 : -1)
      ctx.beginPath()
      for (let p = 0; p <= POINTS; p++) {
        const a = (p / POINTS) * Math.PI * 2
        let r = 1
        for (const k of active)
          r += layer.w[k]! * Math.sin(KS[k]! * a + phase)
        const rr = R * layer.scale * r
        const x = width / 2 + rr * Math.cos(a + spin)
        const y = height / 2 + rr * Math.sin(a + spin)
        if (p)
          ctx.lineTo(x, y)
        else
          ctx.moveTo(x, y)
      }
      ctx.stroke()
    }
  })
}

function loop(now: number) {
  start ||= now
  draw(now - start)
  raf = visible && !reduced ? requestAnimationFrame(loop) : 0
}

function resize() {
  const el = canvas.value
  if (!el)
    return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = Math.round(el.clientWidth * dpr)
  el.height = Math.round(el.clientHeight * dpr)
  draw(start ? performance.now() - start : 0)
}

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  retarget()
  ro = new ResizeObserver(resize)
  ro.observe(canvas.value!)
  resize()
  io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting
    if (visible && !raf && !reduced)
      raf = requestAnimationFrame(loop)
  })
  io.observe(canvas.value!)
})

onUnmounted(() => {
  visible = false
  cancelAnimationFrame(raf)
  io?.disconnect()
  ro?.disconnect()
})

watch(() => [props.seed, props.colors.join()], retarget)
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none block aspect-square" aria-hidden="true" />
</template>
