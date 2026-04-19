import type { ComputedRef, Ref } from 'vue'
import { getCachedLogoBlob, pruneLogoCache, putCachedLogoBlob } from '~/utils/imageCache'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

const inFlight = new Map<string, Promise<Blob | null>>()

async function fetchAsBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url, { method: 'GET', mode: 'cors' })
    if (!res.ok)
      return null
    return await res.blob()
  }
  catch {
    return null
  }
}

async function resolveBlob(url: string): Promise<Blob | null> {
  try {
    const cached = await getCachedLogoBlob(url)
    if (cached)
      return cached
  }
  catch {
    // ignore IDB failures; we will fall back to network URL
  }

  const existing = inFlight.get(url)
  if (existing)
    return existing

  const p = (async () => {
    const blob = await fetchAsBlob(url)
    if (!blob)
      return null
    try {
      await putCachedLogoBlob(url, blob)
      // Best-effort prune; don't block rendering.
      pruneLogoCache().catch(() => {})
    }
    catch {
      // ignore
    }
    return blob
  })()

  inFlight.set(url, p)
  try {
    return await p
  }
  finally {
    inFlight.delete(url)
  }
}

export function useCachedLogo(rawUrl: MaybeRef<string | null>) {
  const src = ref<string | null>(null)
  let objectUrl: string | null = null
  let lastRaw: string | null = null

  function setSrc(next: string | null) {
    src.value = next
  }

  function revoke() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
  }

  async function update(nextRaw: string | null) {
    lastRaw = nextRaw
    revoke()

    if (!import.meta.client) {
      setSrc(nextRaw)
      return
    }

    if (!nextRaw) {
      setSrc(null)
      return
    }

    // Default to network URL immediately, then upgrade to cached blob if available.
    setSrc(nextRaw)

    const blob = await resolveBlob(nextRaw)
    // If URL changed while awaiting, ignore.
    if (lastRaw !== nextRaw)
      return
    if (!blob)
      return

    try {
      objectUrl = URL.createObjectURL(blob)
      setSrc(objectUrl)
    }
    catch {
      // If createObjectURL fails, keep network URL
      revoke()
      setSrc(nextRaw)
    }
  }

  watch(
    () => unref(rawUrl),
    next => {
      update(next)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    lastRaw = null
    revoke()
  })

  return { src }
}

