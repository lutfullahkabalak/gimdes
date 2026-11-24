/**
 * Kategori renkleri. Yalnızca geçerli kayıtlarda kullanılır; geçersiz kayıt rengini
 * kaybeder (gri). Böylece renk hiçbir zaman durumla karışmaz.
 */
export const PALETTE = {
  coral: '#ff8f78',
  sun: '#ffcf45',
  lime: '#bdea52',
  mint: '#5ce3aa',
  sky: '#74cbff',
  lilac: '#b5b0ff',
  pink: '#ff9fd4',
  peach: '#ffb47d',
} as const

export const NO_COLOR = '#dfe3e1'

type ColorName = keyof typeof PALETTE

const RULES: [RegExp, ColorName][] = [
  [/kırmızı et|işlenmiş et|salça|turşu/, 'coral'],
  [/beyaz et|yumurta|bisküvi|unlu mam|ekmek|makarna/, 'peach'],
  [/baharat|^bal$|bitkisel yağ|^un$|tahıl|nişasta/, 'sun'],
  [/bakliyat|sebze|aromatik|zeytin/, 'lime'],
  [/süt|peynir|^su$|temizlik|tuz/, 'sky'],
  [/çay|kuruyemiş|ambalaj|üretim yardımcı/, 'mint'],
  [/kozmetik|bebek|dondurma|helva|özel gıda/, 'pink'],
  [/katkı|aromalar|takviye|meşrubat|meyve suyu|tıbbi/, 'lilac'],
]

export function hashText(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // Yakın metinler (kah / kahv) de belirgin biçimde ayrışsın.
  h ^= h >>> 15
  h = Math.imul(h, 2246822507)
  h ^= h >>> 13
  return h >>> 0
}

export function categoryColor(name: string | null | undefined): string {
  const t = ((name ?? '').split('/')[0] ?? '').trim().toLocaleLowerCase('tr-TR')
  const rule = RULES.find(([re]) => re.test(t))
  if (rule)
    return PALETTE[rule[1]]
  const all = Object.values(PALETTE)
  return all[hashText(t) % all.length]!
}
