import type { Certificate } from '~/types/gimdes'
import { durumSuggestsActive, getCertAlertKind, parseCertEndDate } from '~/utils/certStatus'

export type CertTone = 'success' | 'warning' | 'error' | 'neutral'

/** Ekranda gösterilecek durum; upstream sayısal kodu kullanıcıya gösterilmez. */
export function certStatusDisplay(cert: Certificate): { label: string, tone: CertTone, icon: string } {
  const kind = getCertAlertKind(cert)
  const code = (cert.Durum ?? '').trim()
  if (kind === 'cancelled')
    return { label: 'İptal', tone: 'error', icon: 'i-lucide-ban' }
  if (kind === 'suspended')
    return { label: 'Askıda', tone: 'error', icon: 'i-lucide-circle-pause' }
  if (kind === 'expired')
    return { label: code === '-3' ? 'Yenilenmeyecek' : 'Süresi geçmiş', tone: 'warning', icon: 'i-lucide-calendar-x' }
  if (code === '-5')
    return { label: 'Yenileme sürecinde', tone: 'neutral', icon: 'i-lucide-refresh-cw' }
  if (durumSuggestsActive(cert))
    return { label: 'Geçerli', tone: 'success', icon: 'i-lucide-circle-check' }
  return { label: code && !/^-?\d+$/.test(code) ? code : 'Durum belirtilmemiş', tone: 'neutral', icon: 'i-lucide-circle-help' }
}

/** "Baharat/ Spices" → "Baharat" */
export function categoryNameTr(name: string | null | undefined): string {
  const raw = (name ?? '').trim()
  return raw.split('/')[0]?.trim() || raw
}

/** ISO tarihi GG.AA.YYYY yapar; boş ve upstream'in 0001 yer tutucusu için null. */
export function formatCertDate(raw: string | null | undefined): string | null {
  const d = parseCertEndDate(raw ?? '')
  if (!d || d.getFullYear() < 1900)
    return null
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`
}

/** Upstream bazı adresleri şemasız verir; yalnızca http(s) bağlantısı üretir. */
export function websiteHref(raw: string | null | undefined): string | null {
  const s = (raw ?? '').trim()
  if (!s || /\s/.test(s))
    return null
  const url = /^https?:\/\//i.test(s) ? s : `https://${s}`
  try {
    const u = new URL(url)
    return u.hostname.includes('.') ? u.href : null
  }
  catch {
    return null
  }
}
