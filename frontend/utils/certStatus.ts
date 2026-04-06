import type { Certificate } from '~/types/gimdes'

/** İptal veya süre dolumu — iptal önceliklidir (kırmızı). */
export type CertAlertKind = 'cancelled' | 'expired'

/**
 * Kategori bazlı süre mantığı:
 * - `status_only`: Bitiş tarihi tek başına kullanılmaz; yalnızca `Durum` metni (ör. "Süresi dolmuş").
 *   Kahve/çay gibi kategorilerde sitedeki tarih alanı bazen yanıltıcı olabildiği için.
 * - `hybrid`: Önce `Durum` ("Aktif" ise süresi geçmiş sayılmaz), değilse bitiş tarihi.
 */
export type ExpiryStrategy = 'status_only' | 'hybrid'

function kategoriTrLower(cert: Certificate): string {
  return (cert.KategoriAdi ?? '').toLocaleLowerCase('tr-TR')
}

export function expiryStrategyForCategory(cert: Certificate): ExpiryStrategy {
  const cat = kategoriTrLower(cert)
  if (
    cat.includes('kahve')
    || cat.includes('çay')
    || cat.includes('cay')
    || cat.includes('meşrubat')
    || cat.includes('mesrubat')
    || cat.includes('meyve suyu')
    || cat === 'su'
    || cat.startsWith('su/')
  ) {
    return 'status_only'
  }
  return 'hybrid'
}

/** Upstream Durum metni süresi dolmuş / geçmiş ima ediyor mu. */
export function durumSuggestsExpired(cert: Certificate): boolean {
  const d = (cert.Durum ?? '').toLocaleLowerCase('tr-TR').trim()
  if (!d)
    return false
  return (
    d.includes('süresi dolm')
    || d.includes('suresi dolm')
    || d.includes('süresi geç')
    || d.includes('suresi gec')
    || d.includes('süresi bit')
    || d.includes('suresi bit')
  )
}

/** Upstream açıkça geçerli sertifika (tarih tek başına süresi dolmuş yapma). */
export function durumSuggestsActive(cert: Certificate): boolean {
  const d = (cert.Durum ?? '').toLocaleLowerCase('tr-TR').trim()
  if (!d)
    return false
  return d === 'aktif' || d.startsWith('aktif ') || d.includes('belgeli')
}

export function isCertCancelled(cert: Certificate): boolean {
  const ex = cert.IptalAciklamasi
  if (typeof ex === 'string' && ex.trim().length > 0)
    return true
  const d = (cert.Durum ?? '').toLocaleLowerCase('tr-TR')
  return d.includes('iptal')
}

/** Gün başına göre bitiş tarihi bugünden önce mi (iptal değilse). */
export function parseCertEndDate(raw: string): Date | null {
  const s = raw?.trim()
  if (!s)
    return null
  const dmY = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(s)
  if (dmY) {
    const day = Number(dmY[1])
    const month = Number(dmY[2])
    const year = Number(dmY[3])
    const dt = new Date(year, month - 1, day)
    return Number.isNaN(dt.getTime()) ? null : dt
  }
  const t = Date.parse(s)
  if (Number.isNaN(t))
    return null
  return new Date(t)
}

function isExpiredByEndDate(cert: Certificate): boolean {
  const end = parseCertEndDate(cert.SertifikaBitisTarihi)
  if (!end)
    return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const e = new Date(end.getTime())
  e.setHours(0, 0, 0, 0)
  return e < today
}

export function isCertExpired(cert: Certificate): boolean {
  if (isCertCancelled(cert))
    return false

  const strategy = expiryStrategyForCategory(cert)

  if (strategy === 'status_only') {
    if (durumSuggestsActive(cert))
      return false
    if (durumSuggestsExpired(cert))
      return true
    // İçecek kategorilerinde: anlamlı ama süreyle ilgisiz Durum metni varsa tarihe güvenme
    if ((cert.Durum ?? '').trim())
      return false
    return isExpiredByEndDate(cert)
  }

  // hybrid: Aktif yazıyorsa tarih ne olursa olsun süresi geçmiş sayma
  if (durumSuggestsActive(cert))
    return false
  if (durumSuggestsExpired(cert))
    return true
  return isExpiredByEndDate(cert)
}

export function getCertAlertKind(cert: Certificate): CertAlertKind | null {
  if (isCertCancelled(cert))
    return 'cancelled'
  if (isCertExpired(cert))
    return 'expired'
  return null
}

export function certBadgeColor(cert: Certificate): 'success' | 'warning' | 'error' | 'neutral' {
  const kind = getCertAlertKind(cert)
  if (kind === 'cancelled')
    return 'error'
  if (kind === 'expired')
    return 'warning'
  const durum = cert.Durum ?? ''
  if (durum === 'Aktif')
    return 'success'
  if (durum.includes('Askı') || durum.includes('askı'))
    return 'warning'
  return 'neutral'
}

/** Ana sayfa — kartın tamamı (gimdes-surface arka planını ezer). */
export function certHomeTileShellClass(cert: Certificate): string {
  const k = getCertAlertKind(cert)
  if (k === 'cancelled') {
    return '!border-red-400/45 !bg-gradient-to-br !from-red-100 !to-red-50/92 ring-red-500/20 dark:!from-red-950/80 dark:!to-red-950/35'
  }
  if (k === 'expired') {
    return '!border-amber-400/45 !bg-gradient-to-br !from-amber-100 !to-amber-50/92 ring-amber-500/15 dark:!from-amber-950/70 dark:!to-amber-950/32'
  }
  return ''
}

/** Ana sayfa — içerik kolonunun gradient’i. */
export function certHomeTileInnerClass(cert: Certificate): string {
  const k = getCertAlertKind(cert)
  if (k === 'cancelled') {
    return 'bg-gradient-to-b from-red-50/98 to-red-100/45 dark:from-red-950/30 dark:to-red-950/55'
  }
  if (k === 'expired') {
    return 'bg-gradient-to-b from-amber-50/98 to-amber-100/40 dark:from-amber-950/40 dark:to-amber-950/50'
  }
  return 'bg-gradient-to-b from-elevated/90 to-default'
}

/** Ana sayfa — logo kutusu. */
export function certHomeTileLogoPanelClass(cert: Certificate): string {
  const k = getCertAlertKind(cert)
  if (k === 'cancelled') {
    return 'bg-red-100/75 ring-red-300/55 dark:bg-red-950/45 dark:ring-red-800/40'
  }
  if (k === 'expired') {
    return 'bg-amber-100/75 ring-amber-300/50 dark:bg-amber-950/45 dark:ring-amber-800/40'
  }
  return ''
}

export function certHomeTileCornerLabel(cert: Certificate): string | null {
  const k = getCertAlertKind(cert)
  if (k === 'cancelled')
    return 'İptal'
  if (k === 'expired')
    return 'Süresi geçmiş'
  return null
}

/** Arama sonuç kartları — mevcut yüzey üzerine kırmızı / sarı ton. */
export function certCardSurfaceClass(cert: Certificate): string {
  const kind = getCertAlertKind(cert)
  if (kind === 'cancelled') {
    return 'bg-gradient-to-br from-red-500/22 to-elevated/30 ring-red-500/15 hover:border-red-400/65 hover:ring-red-500/25 dark:from-red-950/50'
  }
  if (kind === 'expired') {
    return 'bg-gradient-to-br from-amber-400/26 to-elevated/30 ring-amber-500/12 hover:border-amber-400/60 hover:ring-amber-500/20 dark:from-amber-950/45'
  }
  return ''
}

export function certDetailPageShellClass(kind: CertAlertKind | null): string {
  if (kind === 'cancelled') {
    return 'min-h-[calc(100dvh-6rem)] w-full rounded-2xl border border-red-300/55 bg-red-50/90 px-4 py-6 shadow-sm sm:px-6 dark:border-red-900/55 dark:bg-red-950/40'
  }
  if (kind === 'expired') {
    return 'min-h-[calc(100dvh-6rem)] w-full rounded-2xl border border-amber-300/60 bg-amber-50/90 px-4 py-6 shadow-sm sm:px-6 dark:border-amber-900/50 dark:bg-amber-950/35'
  }
  return ''
}
