import { describe, expect, it } from 'vitest'
import type { Certificate } from '~/types/gimdes'
import { categoryNameTr, certStatusDisplay, formatCertDate, websiteHref } from './certDisplay'
import { isOutOfScopeMatch, textIncludesTr } from './matchScope'

const c = (o: Partial<Certificate>) => ({ KategoriAdi: 'Tuz/ Salt', SertifikaBitisTarihi: '2999-01-01', ...o }) as Certificate

describe('certDisplay', () => {
  it.each([
    ['0', 'Geçerli'], ['-1', 'İptal'], ['-2', 'Süresi geçmiş'],
    ['-3', 'Yenilenmeyecek'], ['-4', 'Askıda'], ['-5', 'Yenileme sürecinde'],
    ['', 'Durum belirtilmemiş'], ['9', 'Durum belirtilmemiş'],
  ])('labels code %s as %s', (Durum, label) => {
    expect(certStatusDisplay(c({ Durum })).label).toBe(label)
  })

  it('formats dates and hides placeholders', () => {
    expect(formatCertDate('2027-10-07T00:00:00')).toBe('07.10.2027')
    expect(formatCertDate('0001-01-01T00:00:00')).toBeNull()
    expect(formatCertDate(null)).toBeNull()
  })

  it('shortens bilingual category names', () => {
    expect(categoryNameTr('Baharat/ Spices')).toBe('Baharat')
  })

  it('builds safe website links', () => {
    expect(websiteHref('www.ornek.com')).toBe('https://www.ornek.com/')
    expect(websiteHref('javascript:alert(1)')).toBeNull()
    expect(websiteHref('yok')).toBeNull()
  })
})

describe('scope helpers', () => {
  it('filters with Turkish casing', () => {
    expect(textIncludesTr('diş', 'DİŞ MACUNU')).toBe(true)
    expect(textIncludesTr('', 'x')).toBe(true)
  })

  it('flags matches found only outside the scope', () => {
    expect(isOutOfScopeMatch('jelatin', c({ in_scope_lines: ['Şeker'], out_of_scope_lines: ['Jelatin'] }))).toBe(true)
    expect(isOutOfScopeMatch('şeker', c({ in_scope_lines: ['Şeker'], out_of_scope_lines: ['Şeker'] }))).toBe(false)
  })
})
