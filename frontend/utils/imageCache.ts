type CachedBlobEntry = {
  url: string
  blob: Blob
  updatedAt: number
}

const DB_NAME = 'gimdes_image_cache'
const DB_VERSION = 1
const STORE_LOGOS = 'logos'

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const DEFAULT_MAX_ENTRIES = 250

function openDb(): Promise<IDBDatabase> {
  if (!import.meta.client)
    return Promise.reject(new Error('IndexedDB is only available on the client'))

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_LOGOS)) {
        const store = db.createObjectStore(STORE_LOGOS, { keyPath: 'url' })
        store.createIndex('updatedAt', 'updatedAt')
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'))
  })
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  return openDb().then(
    db =>
      new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_LOGOS, mode)
        const store = tx.objectStore(STORE_LOGOS)

        let req: IDBRequest<T> | void
        try {
          req = fn(store)
        }
        catch (e) {
          db.close()
          reject(e)
          return
        }

        if (req) {
          req.onsuccess = () => resolve(req.result)
          req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
        }

        tx.oncomplete = () => db.close()
        tx.onabort = () => {
          db.close()
          reject(tx.error ?? new Error('IndexedDB transaction aborted'))
        }
        tx.onerror = () => {
          db.close()
          reject(tx.error ?? new Error('IndexedDB transaction error'))
        }
      }),
  )
}

export async function getCachedLogoBlob(
  url: string,
  opts?: { ttlMs?: number },
): Promise<Blob | null> {
  const ttlMs = opts?.ttlMs ?? DEFAULT_TTL_MS
  const now = Date.now()
  const entry = (await withStore<CachedBlobEntry>('readonly', store => store.get(url))) as
    | CachedBlobEntry
    | undefined

  if (!entry || !entry.blob)
    return null

  if (ttlMs > 0 && now - entry.updatedAt > ttlMs) {
    // Lazy expire.
    try {
      await withStore('readwrite', store => store.delete(url))
    }
    catch {
      // ignore
    }
    return null
  }

  return entry.blob
}

export async function putCachedLogoBlob(url: string, blob: Blob): Promise<void> {
  const entry: CachedBlobEntry = { url, blob, updatedAt: Date.now() }
  await withStore('readwrite', store => store.put(entry))
}

export async function pruneLogoCache(opts?: { ttlMs?: number; maxEntries?: number }): Promise<void> {
  const ttlMs = opts?.ttlMs ?? DEFAULT_TTL_MS
  const maxEntries = opts?.maxEntries ?? DEFAULT_MAX_ENTRIES
  const now = Date.now()

  const db = await openDb()
  try {
    const tx = db.transaction(STORE_LOGOS, 'readwrite')
    const store = tx.objectStore(STORE_LOGOS)
    const idx = store.index('updatedAt')

    const deletions: string[] = []
    let count = 0

    await new Promise<void>((resolve, reject) => {
      const cursorReq = idx.openCursor()
      cursorReq.onerror = () => reject(cursorReq.error ?? new Error('Failed to iterate cache'))
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result as IDBCursorWithValue | null
        if (!cursor) {
          resolve()
          return
        }
        const value = cursor.value as CachedBlobEntry
        count += 1
        if (ttlMs > 0 && now - value.updatedAt > ttlMs)
          deletions.push(value.url)
        cursor.continue()
      }
    })

    // Delete expired first.
    for (const url of deletions)
      store.delete(url)

    // Enforce size cap by deleting oldest entries.
    const targetCount = Math.max(0, maxEntries)
    const excess = Math.max(0, count - deletions.length - targetCount)
    if (excess > 0) {
      let removed = 0
      await new Promise<void>((resolve, reject) => {
        const cursorReq = idx.openCursor()
        cursorReq.onerror = () => reject(cursorReq.error ?? new Error('Failed to iterate cache'))
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result as IDBCursorWithValue | null
          if (!cursor) {
            resolve()
            return
          }
          const value = cursor.value as CachedBlobEntry
          // Skip ones already scheduled for deletion.
          if (!deletions.includes(value.url)) {
            store.delete(value.url)
            removed += 1
            if (removed >= excess) {
              resolve()
              return
            }
          }
          cursor.continue()
        }
      })
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onabort = () => reject(tx.error ?? new Error('Cache prune aborted'))
      tx.onerror = () => reject(tx.error ?? new Error('Cache prune error'))
    })
  }
  finally {
    db.close()
  }
}

