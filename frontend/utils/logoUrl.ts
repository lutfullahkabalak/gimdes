/** gimdes.com ile aynı kurumsal logo dosyası */
export const gimdesBrandLogoUrl = 'https://gimdes.com/Content/images/gimdes-logo.png'

export function logoUrl(path: string | null | undefined): string | null {
  if (!path) return null
  const p = String(path).trim()
  if (!p) return null
  if (p.startsWith('http://') || p.startsWith('https://')) return p
  return `https://gimnet.gimdes.com/Upload/${p.replace(/^\/+/, '')}`
}
