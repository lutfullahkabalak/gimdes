import type { Certificate } from '~/types/gimdes'

/** İptal, askı veya süre dolumu — iptal önceliklidir (kırmızı). Askı, iptal ile aynı kırmızı yüzeyde gösterilir. */
export type CertAlertKind = 'cancelled' | 'suspended' | 'expired'

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

/**
 * Upstream `Durum` kodları (gimdes.com): 0 geçerli, -1 iptal, -2 süresi geçmiş,
 * -3 yenilenmeyecek, -4 askıda, -5 yenileme sürecinde. Kod, geçmiş askı
 * notundan önceliklidir; `IptalAciklamasi` ise koddan bağımsız iptal sayılır. Bilinmeyen kod/metin: null.
 */
function durumCode(cert: Certificate): string | null {
  const raw = (cert.Durum ?? '').trim()
  return /^(0|-[1-5])$/.test(raw) ? raw : null
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
  const raw = (cert.Durum ?? '').trim()
  if (!raw)
    return false
  if (raw === '0')
    return true
  const d = raw.toLocaleLowerCase('tr-TR')
  return d === 'aktif' || d.startsWith('aktif ') || d.includes('belgeli')
}

/** Upstream sayısal/metin `Durum` kodu şu an askıda mı. */
export function durumSuggestsSuspended(cert: Certificate): boolean {
  const raw = (cert.Durum ?? '').trim()
  if (raw === '-4')
    return true
  return textImpliesSuspendedCategoryOrPhrase(cert.Durum)
}

export function isCertCancelled(cert: Certificate): boolean {
  if (durumCode(cert) === '-1')
    return true
  const ex = cert.IptalAciklamasi
  if (typeof ex === 'string' && ex.trim().length > 0)
    return true
  const d = (cert.Durum ?? '').toLocaleLowerCase('tr-TR')
  return d.includes('iptal')
}

function textImpliesSuspendedCategoryOrPhrase(raw: string | null | undefined): boolean {
  const t = (raw ?? '').toLocaleLowerCase('tr-TR')
  if (t.includes('askıya') || t.includes('askiya'))
    return true
  // ASCII / farklı kodlama: "ASKIYA ALINANLAR" vb.
  const folded = t.replace(/ı/g, 'i').replace(/İ/g, 'i')
  if (folded.includes('askiya'))
    return true
  const d = t.trim()
  // "Askıda", "askı"; "baskı" içinde yanlış eşleşme olmasın
  if (d.startsWith('askı') || d.includes(' askı'))
    return true
  return false
}

/**
 * Askıya alınmış (iptal değil).
 * - Birincil kaynak: upstream `Durum` kodu (`-4` = askıda).
 * - Bilinen bir `Durum` kodu (ör. `"0"` aktif) varsa `AskiyaAlmaAciklama` geçmiş not olabilir; askı sayılmaz.
 * - Diğer durumlarda `AskiyaAlmaAciklama` veya `KategoriAdi` metin heuristikleri.
 */
export function isCertSuspended(cert: Certificate): boolean {
  if (isCertCancelled(cert))
    return false
  const code = durumCode(cert)
  if (code)
    return code === '-4' || textImpliesSuspendedCategoryOrPhrase(cert.KategoriAdi)
  if (durumSuggestsSuspended(cert))
    return true
  if (durumSuggestsActive(cert))
    return false
  const ex = cert.AskiyaAlmaAciklama
  if (typeof ex === 'string' && ex.trim().length > 0)
    return true
  return textImpliesSuspendedCategoryOrPhrase(cert.KategoriAdi)
}

/** Aktif değil ama `AskiyaAlmaAciklama` geçmiş askı notu içeriyor. */
export function hasHistoricalSuspensionNote(cert: Certificate): boolean {
  const ex = cert.AskiyaAlmaAciklama
  if (typeof ex !== 'string' || !ex.trim())
    return false
  return !isCertCancelled(cert) && !isCertSuspended(cert)
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
  const code = durumCode(cert)
  if (code === '-2' || code === '-3')
    return true
  if (code === '-5')
    return isExpiredByEndDate(cert)
  if (code)
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
  if (isCertSuspended(cert))
    return 'suspended'
  if (isCertExpired(cert))
    return 'expired'
  return null
}
