import type { Category } from '~/types/gimdes'

const FALLBACK = 'i-lucide-tag'

/** Upstream `Icon` is Bootstrap glyphicons (e.g. `glyphicon-ok-sign valid`) — not Nuxt Icon compatible. */
function turkishPart(name: string): string {
  const part = name.split('/')[0]?.trim() ?? name
  return part.toLocaleLowerCase('tr-TR')
}

type Rule = { match: (t: string, href: string) => boolean; icon: string }

const RULES: Rule[] = [
  { match: t => t.includes('iptal'), icon: 'i-lucide-ban' },
  { match: t => t.includes('süresi geçen') || t.includes('suresi gecen'), icon: 'i-lucide-calendar-clock' },
  { match: t => t.includes('geçersiz') || t.includes('gecersiz'), icon: 'i-lucide-shield-x' },
  { match: t => t.includes('askıya') || t.includes('askiya'), icon: 'i-lucide-pause-circle' },

  { match: t => t.includes('ambalaj'), icon: 'i-lucide-package' },
  { match: t => t.includes('aromalar'), icon: 'i-lucide-sparkles' },
  { match: t => t.includes('aromatik'), icon: 'i-lucide-leaf' },
  { match: t => t.includes('baharat'), icon: 'i-lucide-flame' },
  { match: t => t.includes('bakliyat'), icon: 'i-lucide-wheat' },
  { match: t => t.includes('bal'), icon: 'i-lucide-hexagon' },
  { match: t => t === 'bal' || t.startsWith('bal '), icon: 'i-lucide-jar' },
  { match: t => t.includes('bebek'), icon: 'i-lucide-baby' },
  { match: t => t.includes('beyaz et'), icon: 'i-lucide-drumstick' },
  { match: t => t.includes('bisküvi') || t.includes('biskuvi'), icon: 'i-lucide-cookie' },
  { match: t => t.includes('bitkisel yağ') || t.includes('bitkisel yag'), icon: 'i-lucide-droplet' },
  { match: t => t.includes('catering'), icon: 'i-lucide-utensils-crossed' },
  { match: t => t.includes('dondurma'), icon: 'i-lucide-ice-cream-bowl' },
  { match: t => t.includes('ekmek mayası') || t.includes('ekmek mayasi'), icon: 'i-lucide-flask-conical' },
  { match: t => t.includes('gıda dışı') || t.includes('gida disi'), icon: 'i-lucide-beaker' },
  { match: t => t.includes('gıda katkı') || t.includes('gida katki'), icon: 'i-lucide-test-tube' },
  { match: t => t.includes('giyim'), icon: 'i-lucide-shirt' },
  { match: t => t.includes('helva') || t.includes('reçel') || t.includes('recel'), icon: 'i-lucide-candy' },
  { match: t => t.includes('işlenmiş et') || t.includes('islenmis et'), icon: 'i-lucide-ham' },
  { match: t => t.includes('kırmızı et') || t.includes('kirmizi et'), icon: 'i-lucide-beef' },
  { match: t => t.includes('kozmetik'), icon: 'i-lucide-sparkles' },
  { match: t => t.includes('kuruyemiş') || t.includes('kuruyemis'), icon: 'i-lucide-nut' },
  { match: t => t.includes('makarna'), icon: 'i-lucide-utensils' },
  { match: t => t.includes('meşrubat') || t.includes('mesrubat'), icon: 'i-lucide-cup-soda' },
  { match: t => t.includes('meyve suyu'), icon: 'i-lucide-glass-water' },
  { match: t => t.includes('nişasta') || t.includes('nisasta') || t.includes('tatlandırıcı') || t.includes('tatlandirici'), icon: 'i-lucide-layers' },
  { match: t => t.includes('oyuncak'), icon: 'i-lucide-puzzle' },
  { match: t => t.includes('özel gıda') || t.includes('ozel gida'), icon: 'i-lucide-apple' },
  { match: t => t.includes('peynir maya'), icon: 'i-lucide-microscope' },
  { match: t => t.includes('salça') || t.includes('salca') || t.includes('konserve') || t.includes('turşu') || t.includes('tursu') || t.includes('soslar'), icon: 'i-lucide-soup' },
  { match: t => t.includes('çay') || t.includes('cay') || t.includes('kahve'), icon: 'i-lucide-coffee' },
  { match: t => t === 'su' || t.startsWith('su/'), icon: 'i-lucide-droplets' },
  { match: t => t.includes('süt') || t.includes('sut'), icon: 'i-lucide-milk' },
  { match: t => t.includes('takviye'), icon: 'i-lucide-pill' },
  { match: t => t.includes('temizlik'), icon: 'i-lucide-spray-can' },
  { match: t => t.includes('tıbbi') || t.includes('tibbi') || t.includes('medikal'), icon: 'i-lucide-stethoscope' },
  { match: t => t.includes('tuz'), icon: 'i-lucide-scale' },
  { match: t => t.startsWith('un/') || t === 'un' || /^un /.test(t), icon: 'i-lucide-wheat' },
  { match: t => t.includes('unlu mamul') || t.includes('pastacılık') || t.includes('pastacilik'), icon: 'i-lucide-croissant' },
  { match: t => t.includes('üretim yardımcı') || t.includes('uretim yardimci'), icon: 'i-lucide-wrench' },
  { match: t => t.includes('yaş sebze') || t.includes('yas sebze') || t.includes('fresh vegetable'), icon: 'i-lucide-carrot' },
  { match: t => t.includes('yumurta'), icon: 'i-lucide-egg' },
  { match: t => t.includes('zeytin'), icon: 'i-lucide-circle-dot' },

  { match: (_t, href) => href.includes('KategoriListe'), icon: 'i-lucide-folder-open' },
]

/**
 * Lucide icon name for Nuxt UI (`i-lucide-*`).
 */
export function iconForCategory(category: Pick<Category, 'KategoriAdi' | 'Href'>): string {
  const t = turkishPart(category.KategoriAdi)
  const href = (category.Href ?? '').toLocaleLowerCase('tr-TR')

  for (const { match, icon } of RULES) {
    if (match(t, href))
      return icon
  }
  return FALLBACK
}
