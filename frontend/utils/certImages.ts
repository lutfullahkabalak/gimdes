import type { Certificate, CertificateImage } from '~/types/gimdes'

/** Önizleme kutuları için yerel placeholder (gerçek CDN görseli lightbox’ta yüklenir). */
const CERT_THUMB_PLACEHOLDERS = [
  '/cert-thumbs/1.webp',
  '/cert-thumbs/2.webp',
  '/cert-thumbs/3.webp',
] as const

export function certificateThumbSrc(index: number): string {
  const i = Math.abs(Math.floor(index)) % CERT_THUMB_PLACEHOLDERS.length
  return CERT_THUMB_PLACEHOLDERS[i]!
}

const uploadBase = 'https://gimnet.gimdes.com/Upload/'

function toDisplayUrl(filename: string): string {
  const f = filename.trim()
  if (!f)
    return ''
  if (f.startsWith('http://') || f.startsWith('https://'))
    return f
  return `${uploadBase}${f.replace(/^\/+/, '')}`
}

/** Ham `SertifikaResimleri` dizgesinden görsel listesi (eski sessionStorage için). */
function fromRawSertifikaResimleri(raw: string | null | undefined): CertificateImage[] {
  const s = raw?.trim()
  if (!s)
    return []
  try {
    const arr = JSON.parse(s) as { Filename?: string; OriginalName?: string }[]
    if (!Array.isArray(arr))
      return []
    const out: CertificateImage[] = []
    for (const row of arr) {
      const fn = String(row.Filename ?? '').trim()
      if (!fn)
        continue
      const url = toDisplayUrl(fn)
      if (!url)
        continue
      out.push({
        filename: fn,
        original_name: String(row.OriginalName ?? '').trim(),
        url,
      })
    }
    return out
  }
  catch {
    return []
  }
}

/** API `certificate_images` veya ham upstream alanından birleşik liste. */
export function listCertificateImages(cert: Certificate): CertificateImage[] {
  const enriched = cert.certificate_images
  if (enriched?.length)
    return enriched
  return fromRawSertifikaResimleri(cert.SertifikaResimleri)
}
