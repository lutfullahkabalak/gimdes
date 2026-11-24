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

/**
 * Oturum boyunca açık tutulan blob adresleri. Sayfaya geri dönüldüğünde logo ilk
 * karede hazır olur; adres her seferinde yeniden üretilseydi görsel boş başlardı.
 */
const MAX_OPEN_URLS = 400
const openUrls = new Map<string, { url: string, users: number }>()

function acquire(raw: string, blob?: Blob): string | null {
  let entry = openUrls.get(raw)
  if (!entry) {
    if (!blob)
      return null
    entry = { url: URL.createObjectURL(blob), users: 0 }
  }
  else {
    openUrls.delete(raw)
  }
  entry.users++
  openUrls.set(raw, entry)
  // En eski ve ekranda kullanılmayan adresleri bırak.
  if (openUrls.size > MAX_OPEN_URLS) {
    for (const [key, old] of openUrls) {
      if (openUrls.size <= MAX_OPEN_URLS)
        break
      if (old.users <= 0) {
        URL.revokeObjectURL(old.url)
        openUrls.delete(key)
      }
    }
  }
  return entry.url
}

function release(raw: string) {
  const entry = openUrls.get(raw)
  if (entry)
    entry.users--
}

export function useCachedLogo(rawUrl: MaybeRef<string | null>) {
  const src = ref<string | null>(null)
  /** Logo bellekten anında geldi; belirme animasyonu gerekmez. */
  const instant = ref(false)
  let held: string | null = null
  let lastRaw: string | null = null

  function drop() {
    if (held) {
      release(held)
      held = null
    }
  }

  async function update(nextRaw: string | null) {
    lastRaw = nextRaw
    drop()

    if (!import.meta.client || !nextRaw) {
      src.value = nextRaw
      return
    }

    const ready = acquire(nextRaw)
    instant.value = ready !== null
    if (ready) {
      held = nextRaw
      src.value = ready
      return
    }

    // Default to network URL immediately, then upgrade to cached blob if available.
    src.value = nextRaw

    const blob = await resolveBlob(nextRaw)
    // If URL changed while awaiting, ignore.
    if (lastRaw !== nextRaw || !blob)
      return

    try {
      const url = acquire(nextRaw, blob)
      if (url) {
        held = nextRaw
        src.value = url
      }
    }
    catch {
      // If createObjectURL fails, keep network URL
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
    drop()
  })

  return { src, instant }
}
