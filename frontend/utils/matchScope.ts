import type { FilterFn } from '@tanstack/table-core'
import type { Certificate } from '~/types/gimdes'

/** NBSP vb. görünmez boşlukları normal boşluğa çevirir (tablo/arama eşleşmesi). */
function normalizeSearchWhitespace(s: string): string {
  return s.replace(/\u00a0/g, ' ')
}

/**
 * Türkçe İ/ı için Unicode varsayılan `toLowerCase` yerine tr-TR kullanır; ayrıca NFC ile
 * kaynak metindeki NFD (ör. I + birleşik nokta) tutarsızlığını giderir.
 */
function trLower(s: string): string {
  return normalizeSearchWhitespace(s)
    .normalize('NFC')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFC')
}

/**
 * TanStack Table `globalFilterFn`: hücre ve sorguda `trLower` ile karşılaştırır.
 * Varsayılan `includesString`, `DİŞ` → `di̇ş` (i + U+0307) ürettiği için `diş` ile eşleşmez.
 */
export const tableGlobalFilterTr: FilterFn<any> = (row, columnId, filterValue, _addMeta) => {
  if (filterValue === undefined || filterValue === null || filterValue === '')
    return true
  const search = trLower(String(filterValue).trim())
  if (!search)
    return true
  const hay = trLower(String(row.getValue(columnId) ?? ''))
  return hay.includes(search)
}
tableGlobalFilterTr.autoRemove = (val: unknown) => val === undefined || val === null || val === ''

export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function norm(q: string): string {
  return trLower(q.trim())
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export type QueryHighlightSegment = { text: string; highlight: boolean }

/**
 * Arama sorgusuyla aynı kelime-sınırı kuralını kullanır (`textMatchesQuery` ile uyumlu);
 * eşleşen aralıkları vurgulamak için metni parçalara ayırır.
 */
export function splitQueryHighlightSegments(rawText: string, q: string): QueryHighlightSegment[] {
  const qq = norm(q)
  const plain = normalizeSearchWhitespace(String(rawText ?? '')).normalize('NFC')
  if (!qq || !plain)
    return [{ text: plain, highlight: false }]

  const h = trLower(plain)
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(qq)}(?![\\p{L}\\p{N}])`, 'gu')
  const segments: QueryHighlightSegment[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(h)) !== null) {
    const start = m.index
    const end = start + m[0].length
    if (start > last)
      segments.push({ text: plain.slice(last, start), highlight: false })
    segments.push({ text: plain.slice(start, end), highlight: true })
    last = end
    if (m[0].length === 0)
      re.lastIndex++
  }
  if (last < plain.length)
    segments.push({ text: plain.slice(last), highlight: false })
  if (segments.length === 0)
    return [{ text: plain, highlight: false }]
  return segments
}

/**
 * Sorgunun metinde kelime sınırıyla geçip geçmediği (ör. "afia" → "nafia" içinde eşleşmez).
 * Unicode harf/rakam dışındaki karakterler sınır sayılır.
 */
export function textMatchesQuery(q: string, haystack: string | null | undefined): boolean {
  const qq = norm(q)
  if (!qq) return false
  const h = trLower(String(haystack ?? ''))
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(qq)}(?![\\p{L}\\p{N}])`, 'u')
  return re.test(h)
}

export function productSearchBlob(cert: Certificate): string {
  const parts = [
    cert.KapsamOnizleme,
    cert.AramaIndex,
    ...(cert.in_scope_lines ?? []),
    ...(cert.out_of_scope_lines ?? []),
    stripHtml(cert.SertifikaKapsami),
  ]
  return trLower(parts.filter(Boolean).join(' '))
}

export function firmaSearchBlob(cert: Certificate): string {
  return trLower(
    [
      cert.FirmaAdi,
      cert.MarkaAdi,
      cert.FirmaIl,
      cert.FirmaUlke,
      cert.FirmaAdresi,
      cert.FirmaTelefon,
      cert.FirmaIletisimEmail,
      cert.FirmaWebSayfasi,
      cert.IsletmeKayitNo,
    ]
      .filter(Boolean)
      .join(' '),
  )
}

export function contentSearchBlob(cert: Certificate): string {
  return trLower(
    [
      stripHtml(cert.SertifikaKapsami),
      stripHtml(cert.KapsamDisi),
      ...(cert.in_scope_lines ?? []),
      ...(cert.out_of_scope_lines ?? []),
    ]
      .filter(Boolean)
      .join(' '),
  )
}

export function productAccordionBlob(cert: Certificate): string {
  const parts = [
    cert.KapsamOnizleme,
    cert.AramaIndex,
    ...(cert.in_scope_lines ?? []),
    ...(cert.out_of_scope_lines ?? []),
  ]
  return trLower(parts.filter(Boolean).join(' '))
}

/**
 * Arama kartında akordeon yalnızca sorgu, ürün kapsam satırlarında (in/out scope) geçiyorsa:
 * tek satırda veya satırlar boşlukla birleştirilince tam ifade olarak.
 */
export function matchesProductAccordion(q: string, cert: Certificate): boolean {
  const qq = norm(q)
  if (!qq) return false
  const inScope = cert.in_scope_lines ?? []
  const outScope = cert.out_of_scope_lines ?? []
  for (const raw of [...inScope, ...outScope]) {
    const plain = stripHtml(raw).trim()
    if (plain && textMatchesQuery(q, plain)) return true
  }
  const joinedIn = inScope.map(r => stripHtml(r).trim()).filter(Boolean).join(' ')
  if (joinedIn && textMatchesQuery(q, joinedIn)) return true
  const joinedOut = outScope.map(r => stripHtml(r).trim()).filter(Boolean).join(' ')
  if (joinedOut && textMatchesQuery(q, joinedOut)) return true
  return false
}

export function matchesAnyScope(
  q: string,
  cert: Certificate,
  scopes: { urun: boolean; firma: boolean; icerik: boolean },
): boolean {
  const qq = norm(q)
  if (!qq) return false
  const u = scopes.urun && textMatchesQuery(q, productSearchBlob(cert))
  const f = scopes.firma && textMatchesQuery(q, firmaSearchBlob(cert))
  const c = scopes.icerik && textMatchesQuery(q, contentSearchBlob(cert))
  return u || f || c
}

function dedupeScopeLines(lines: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const l of lines) {
    if (l && !seen.has(l)) {
      seen.add(l)
      out.push(l)
    }
  }
  return out
}

/**
 * Akordeon içeriği: yalnızca kapsam satırları; `matchesProductAccordion` ile aynı koşullarda dolu.
 */
export function productLinesForAccordion(q: string, cert: Certificate): string[] {
  if (!norm(q)) return []

  const inLines = (cert.in_scope_lines ?? []).map(r => stripHtml(r).trim()).filter(Boolean)
  const outLines = (cert.out_of_scope_lines ?? []).map(r => stripHtml(r).trim()).filter(Boolean)

  const matchingIn = inLines.filter(plain => textMatchesQuery(q, plain))
  if (matchingIn.length > 0) return dedupeScopeLines(matchingIn)

  const matchingOut = outLines.filter(plain => textMatchesQuery(q, plain))
  if (matchingOut.length > 0) return dedupeScopeLines(matchingOut)

  const joinedIn = inLines.join(' ')
  if (inLines.length > 0 && textMatchesQuery(q, joinedIn)) return dedupeScopeLines(inLines)

  const joinedOut = outLines.join(' ')
  if (outLines.length > 0 && textMatchesQuery(q, joinedOut)) return dedupeScopeLines(outLines)

  return []
}
