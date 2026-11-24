import { describe, expect, it } from 'vitest'
import { categoryColor, hashText, PALETTE } from './categoryPalette'

describe('categoryPalette', () => {
  it('maps known groups and always returns a palette color', () => {
    expect(categoryColor('Kırmızı Et/ Red Meat')).toBe(PALETTE.coral)
    expect(categoryColor('SÜT VE SÜT ÜRÜNLERİ')).toBe(PALETTE.sky)
    for (const n of ['', null, 'Bilinmeyen'])
      expect(Object.values(PALETTE)).toContain(categoryColor(n))
  })
  it('is deterministic', () => {
    expect(hashText('kahve')).toBe(hashText('kahve'))
    expect(hashText('kah')).not.toBe(hashText('kahv'))
  })
})
