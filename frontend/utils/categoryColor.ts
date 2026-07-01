import type { Category, Certificate } from '~/types/gimdes'

export type CategoryColorSet = {
  shell: string
  inner: string
  logoPanel: string
  badge: string
}

function turkishPart(name: string): string {
  const part = name.split('/')[0]?.trim() ?? name
  return part.toLocaleLowerCase('tr-TR')
}

const NEUTRAL: CategoryColorSet = {
  shell: '!border-slate-400/40 !bg-gradient-to-br !from-slate-100 !to-slate-50/92 ring-slate-500/15 dark:!from-slate-900/75 dark:!to-slate-950/35',
  inner: 'bg-gradient-to-b from-slate-50/98 to-slate-100/40 dark:from-slate-900/35 dark:to-slate-950/50',
  logoPanel: 'bg-slate-100/75 ring-slate-300/50 dark:bg-slate-900/45 dark:ring-slate-700/40',
  badge: 'bg-slate-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-slate-700/95 dark:ring-white/15',
}

const ORANGE: CategoryColorSet = {
  shell: '!border-orange-400/45 !bg-gradient-to-br !from-orange-100 !to-orange-50/92 ring-orange-500/20 dark:!from-orange-950/80 dark:!to-orange-950/35',
  inner: 'bg-gradient-to-b from-orange-50/98 to-orange-100/45 dark:from-orange-950/30 dark:to-orange-950/55',
  logoPanel: 'bg-orange-100/75 ring-orange-300/55 dark:bg-orange-950/45 dark:ring-orange-800/40',
  badge: 'bg-orange-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-orange-700/95 dark:ring-white/15',
}

const AMBER: CategoryColorSet = {
  shell: '!border-amber-400/45 !bg-gradient-to-br !from-amber-100 !to-amber-50/92 ring-amber-500/15 dark:!from-amber-950/70 dark:!to-amber-950/32',
  inner: 'bg-gradient-to-b from-amber-50/98 to-amber-100/40 dark:from-amber-950/40 dark:to-amber-950/50',
  logoPanel: 'bg-amber-100/75 ring-amber-300/50 dark:bg-amber-950/45 dark:ring-amber-800/40',
  badge: 'bg-amber-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-amber-700/95 dark:ring-white/15',
}

const YELLOW: CategoryColorSet = {
  shell: '!border-yellow-400/45 !bg-gradient-to-br !from-yellow-100 !to-yellow-50/92 ring-yellow-500/15 dark:!from-yellow-950/70 dark:!to-yellow-950/32',
  inner: 'bg-gradient-to-b from-yellow-50/98 to-yellow-100/40 dark:from-yellow-950/40 dark:to-yellow-950/50',
  logoPanel: 'bg-yellow-100/75 ring-yellow-300/50 dark:bg-yellow-950/45 dark:ring-yellow-800/40',
  badge: 'bg-yellow-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-yellow-700/95 dark:ring-white/15',
}

const LIME: CategoryColorSet = {
  shell: '!border-lime-400/45 !bg-gradient-to-br !from-lime-100 !to-lime-50/92 ring-lime-500/15 dark:!from-lime-950/70 dark:!to-lime-950/32',
  inner: 'bg-gradient-to-b from-lime-50/98 to-lime-100/40 dark:from-lime-950/40 dark:to-lime-950/50',
  logoPanel: 'bg-lime-100/75 ring-lime-300/50 dark:bg-lime-950/45 dark:ring-lime-800/40',
  badge: 'bg-lime-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-lime-700/95 dark:ring-white/15',
}

const GREEN: CategoryColorSet = {
  shell: '!border-emerald-400/45 !bg-gradient-to-br !from-emerald-100 !to-emerald-50/92 ring-emerald-500/15 dark:!from-emerald-950/70 dark:!to-emerald-950/32',
  inner: 'bg-gradient-to-b from-emerald-50/98 to-emerald-100/40 dark:from-emerald-950/40 dark:to-emerald-950/50',
  logoPanel: 'bg-emerald-100/75 ring-emerald-300/50 dark:bg-emerald-950/45 dark:ring-emerald-800/40',
  badge: 'bg-emerald-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-emerald-700/95 dark:ring-white/15',
}

const TEAL: CategoryColorSet = {
  shell: '!border-teal-400/45 !bg-gradient-to-br !from-teal-100 !to-teal-50/92 ring-teal-500/15 dark:!from-teal-950/70 dark:!to-teal-950/32',
  inner: 'bg-gradient-to-b from-teal-50/98 to-teal-100/40 dark:from-teal-950/40 dark:to-teal-950/50',
  logoPanel: 'bg-teal-100/75 ring-teal-300/50 dark:bg-teal-950/45 dark:ring-teal-800/40',
  badge: 'bg-teal-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-teal-700/95 dark:ring-white/15',
}

const CYAN: CategoryColorSet = {
  shell: '!border-cyan-400/45 !bg-gradient-to-br !from-cyan-100 !to-cyan-50/92 ring-cyan-500/15 dark:!from-cyan-950/70 dark:!to-cyan-950/32',
  inner: 'bg-gradient-to-b from-cyan-50/98 to-cyan-100/40 dark:from-cyan-950/40 dark:to-cyan-950/50',
  logoPanel: 'bg-cyan-100/75 ring-cyan-300/50 dark:bg-cyan-950/45 dark:ring-cyan-800/40',
  badge: 'bg-cyan-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-cyan-700/95 dark:ring-white/15',
}

const SKY: CategoryColorSet = {
  shell: '!border-sky-400/45 !bg-gradient-to-br !from-sky-100 !to-sky-50/92 ring-sky-500/15 dark:!from-sky-950/70 dark:!to-sky-950/32',
  inner: 'bg-gradient-to-b from-sky-50/98 to-sky-100/40 dark:from-sky-950/40 dark:to-sky-950/50',
  logoPanel: 'bg-sky-100/75 ring-sky-300/50 dark:bg-sky-950/45 dark:ring-sky-800/40',
  badge: 'bg-sky-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-sky-700/95 dark:ring-white/15',
}

const BLUE: CategoryColorSet = {
  shell: '!border-blue-400/45 !bg-gradient-to-br !from-blue-100 !to-blue-50/92 ring-blue-500/15 dark:!from-blue-950/70 dark:!to-blue-950/32',
  inner: 'bg-gradient-to-b from-blue-50/98 to-blue-100/40 dark:from-blue-950/40 dark:to-blue-950/50',
  logoPanel: 'bg-blue-100/75 ring-blue-300/50 dark:bg-blue-950/45 dark:ring-blue-800/40',
  badge: 'bg-blue-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-blue-700/95 dark:ring-white/15',
}

const INDIGO: CategoryColorSet = {
  shell: '!border-indigo-400/45 !bg-gradient-to-br !from-indigo-100 !to-indigo-50/92 ring-indigo-500/15 dark:!from-indigo-950/70 dark:!to-indigo-950/32',
  inner: 'bg-gradient-to-b from-indigo-50/98 to-indigo-100/40 dark:from-indigo-950/40 dark:to-indigo-950/50',
  logoPanel: 'bg-indigo-100/75 ring-indigo-300/50 dark:bg-indigo-950/45 dark:ring-indigo-800/40',
  badge: 'bg-indigo-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-indigo-700/95 dark:ring-white/15',
}

const VIOLET: CategoryColorSet = {
  shell: '!border-violet-400/45 !bg-gradient-to-br !from-violet-100 !to-violet-50/92 ring-violet-500/15 dark:!from-violet-950/70 dark:!to-violet-950/32',
  inner: 'bg-gradient-to-b from-violet-50/98 to-violet-100/40 dark:from-violet-950/40 dark:to-violet-950/50',
  logoPanel: 'bg-violet-100/75 ring-violet-300/50 dark:bg-violet-950/45 dark:ring-violet-800/40',
  badge: 'bg-violet-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-violet-700/95 dark:ring-white/15',
}

const PURPLE: CategoryColorSet = {
  shell: '!border-purple-400/45 !bg-gradient-to-br !from-purple-100 !to-purple-50/92 ring-purple-500/15 dark:!from-purple-950/70 dark:!to-purple-950/32',
  inner: 'bg-gradient-to-b from-purple-50/98 to-purple-100/40 dark:from-purple-950/40 dark:to-purple-950/50',
  logoPanel: 'bg-purple-100/75 ring-purple-300/50 dark:bg-purple-950/45 dark:ring-purple-800/40',
  badge: 'bg-purple-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-purple-700/95 dark:ring-white/15',
}

const FUCHSIA: CategoryColorSet = {
  shell: '!border-fuchsia-400/45 !bg-gradient-to-br !from-fuchsia-100 !to-fuchsia-50/92 ring-fuchsia-500/15 dark:!from-fuchsia-950/70 dark:!to-fuchsia-950/32',
  inner: 'bg-gradient-to-b from-fuchsia-50/98 to-fuchsia-100/40 dark:from-fuchsia-950/40 dark:to-fuchsia-950/50',
  logoPanel: 'bg-fuchsia-100/75 ring-fuchsia-300/50 dark:bg-fuchsia-950/45 dark:ring-fuchsia-800/40',
  badge: 'bg-fuchsia-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-fuchsia-700/95 dark:ring-white/15',
}

const PINK: CategoryColorSet = {
  shell: '!border-pink-400/45 !bg-gradient-to-br !from-pink-100 !to-pink-50/92 ring-pink-500/15 dark:!from-pink-950/70 dark:!to-pink-950/32',
  inner: 'bg-gradient-to-b from-pink-50/98 to-pink-100/40 dark:from-pink-950/40 dark:to-pink-950/50',
  logoPanel: 'bg-pink-100/75 ring-pink-300/50 dark:bg-pink-950/45 dark:ring-pink-800/40',
  badge: 'bg-pink-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-pink-700/95 dark:ring-white/15',
}

const ROSE: CategoryColorSet = {
  shell: '!border-rose-400/45 !bg-gradient-to-br !from-rose-100 !to-rose-50/92 ring-rose-500/15 dark:!from-rose-950/70 dark:!to-rose-950/32',
  inner: 'bg-gradient-to-b from-rose-50/98 to-rose-100/40 dark:from-rose-950/40 dark:to-rose-950/50',
  logoPanel: 'bg-rose-100/75 ring-rose-300/50 dark:bg-rose-950/45 dark:ring-rose-800/40',
  badge: 'bg-rose-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-rose-700/95 dark:ring-white/15',
}

const STONE: CategoryColorSet = {
  shell: '!border-stone-400/45 !bg-gradient-to-br !from-stone-100 !to-stone-50/92 ring-stone-500/15 dark:!from-stone-950/70 dark:!to-stone-950/32',
  inner: 'bg-gradient-to-b from-stone-50/98 to-stone-100/40 dark:from-stone-950/40 dark:to-stone-950/50',
  logoPanel: 'bg-stone-100/75 ring-stone-300/50 dark:bg-stone-950/45 dark:ring-stone-800/40',
  badge: 'bg-stone-600/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-stone-700/95 dark:ring-white/15',
}

const RED: CategoryColorSet = {
  shell: '!border-red-300/45 !bg-gradient-to-br !from-red-50 !to-rose-50/92 ring-red-400/15 dark:!from-red-950/60 dark:!to-red-950/28',
  inner: 'bg-gradient-to-b from-red-50/95 to-rose-50/40 dark:from-red-950/35 dark:to-red-950/48',
  logoPanel: 'bg-red-50/80 ring-red-200/50 dark:bg-red-950/40 dark:ring-red-900/35',
  badge: 'bg-red-500/90 text-white shadow-sm ring-2 ring-white/70 dark:bg-red-600/95 dark:ring-white/15',
}

type Rule = { match: (t: string, href: string) => boolean; colors: CategoryColorSet }

/** categoryIcon.ts ile aynı kural sırası. */
const RULES: Rule[] = [
  { match: t => t.includes('iptal'), colors: NEUTRAL },
  { match: t => t.includes('süresi geçen') || t.includes('suresi gecen'), colors: NEUTRAL },
  { match: t => t.includes('geçersiz') || t.includes('gecersiz'), colors: NEUTRAL },
  { match: t => t.includes('askıya') || t.includes('askiya'), colors: NEUTRAL },

  { match: t => t.includes('ambalaj'), colors: STONE },
  { match: t => t.includes('aromalar'), colors: FUCHSIA },
  { match: t => t.includes('aromatik'), colors: GREEN },
  { match: t => t.includes('baharat'), colors: ORANGE },
  { match: t => t.includes('bakliyat'), colors: AMBER },
  { match: t => t.includes('bal'), colors: YELLOW },
  { match: t => t === 'bal' || t.startsWith('bal '), colors: AMBER },
  { match: t => t.includes('bebek'), colors: SKY },
  { match: t => t.includes('beyaz et'), colors: ROSE },
  { match: t => t.includes('bisküvi') || t.includes('biskuvi'), colors: AMBER },
  { match: t => t.includes('bitkisel yağ') || t.includes('bitkisel yag'), colors: YELLOW },
  { match: t => t.includes('catering'), colors: ORANGE },
  { match: t => t.includes('dondurma'), colors: CYAN },
  { match: t => t.includes('ekmek mayası') || t.includes('ekmek mayasi'), colors: PURPLE },
  { match: t => t.includes('gıda dışı') || t.includes('gida disi'), colors: STONE },
  { match: t => t.includes('gıda katkı') || t.includes('gida katki'), colors: VIOLET },
  { match: t => t.includes('giyim'), colors: INDIGO },
  { match: t => t.includes('helva') || t.includes('reçel') || t.includes('recel'), colors: PINK },
  { match: t => t.includes('işlenmiş et') || t.includes('islenmis et'), colors: ROSE },
  { match: t => t.includes('kırmızı et') || t.includes('kirmizi et'), colors: RED },
  { match: t => t.includes('kozmetik'), colors: VIOLET },
  { match: t => t.includes('kuruyemiş') || t.includes('kuruyemis'), colors: ORANGE },
  { match: t => t.includes('makarna'), colors: YELLOW },
  { match: t => t.includes('meşrubat') || t.includes('mesrubat'), colors: BLUE },
  { match: t => t.includes('meyve suyu'), colors: ORANGE },
  { match: t => t.includes('nişasta') || t.includes('nisasta') || t.includes('tatlandırıcı') || t.includes('tatlandirici'), colors: STONE },
  { match: t => t.includes('oyuncak'), colors: PINK },
  { match: t => t.includes('özel gıda') || t.includes('ozel gida'), colors: GREEN },
  { match: t => t.includes('peynir maya'), colors: YELLOW },
  { match: t => t.includes('salça') || t.includes('salca') || t.includes('konserve') || t.includes('turşu') || t.includes('tursu') || t.includes('soslar'), colors: RED },
  { match: t => t.includes('çay') || t.includes('cay') || t.includes('kahve'), colors: AMBER },
  { match: t => t === 'su' || t.startsWith('su/'), colors: CYAN },
  { match: t => t.includes('süt') || t.includes('sut'), colors: SKY },
  { match: t => t.includes('takviye'), colors: TEAL },
  { match: t => t.includes('temizlik'), colors: BLUE },
  { match: t => t.includes('tıbbi') || t.includes('tibbi') || t.includes('medikal'), colors: TEAL },
  { match: t => t.includes('tuz'), colors: STONE },
  { match: t => t.startsWith('un/') || t === 'un' || /^un /.test(t), colors: AMBER },
  { match: t => t.includes('unlu mamul') || t.includes('pastacılık') || t.includes('pastacilik'), colors: ORANGE },
  { match: t => t.includes('üretim yardımcı') || t.includes('uretim yardimci'), colors: NEUTRAL },
  { match: t => t.includes('yaş sebze') || t.includes('yas sebze') || t.includes('fresh vegetable'), colors: LIME },
  { match: t => t.includes('yumurta'), colors: YELLOW },
  { match: t => t.includes('zeytin'), colors: LIME },

  { match: (_t, href) => href.includes('KategoriListe'), colors: NEUTRAL },
]

export function colorSetForCategory(
  category: Pick<Category, 'KategoriAdi'> & { Href?: string },
): CategoryColorSet {
  const t = turkishPart(category.KategoriAdi)
  const href = (category.Href ?? '').toLocaleLowerCase('tr-TR')

  for (const { match, colors } of RULES) {
    if (match(t, href))
      return colors
  }
  return NEUTRAL
}

export function colorSetForCertificate(cert: Certificate): CategoryColorSet {
  return colorSetForCategory({ KategoriAdi: cert.KategoriAdi, Href: '' })
}
