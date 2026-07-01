import { describe, expect, it } from 'vitest'
import type { Certificate } from '~/types/gimdes'
import {
  durumSuggestsActive,
  durumSuggestsSuspended,
  getCertAlertKind,
  hasHistoricalSuspensionNote,
  isCertCancelled,
  isCertSuspended,
} from './certStatus'

function cert(overrides: Partial<Certificate> = {}): Certificate {
  return {
    KategoriAdi: 'Dondurma',
    FirmaId: 1,
    FirmaAdi: 'Test Firma',
    FirmaTelefon: '',
    FirmaWebSayfasi: null,
    FirmaIletisimEmail: '',
    FirmaIl: '',
    FirmaUlke: '',
    SertifikaId: 1,
    KategoriId: 1,
    MarkaAdi: 'TEST',
    MarkaLogosu: null,
    SertifikaNo: '1',
    FirmaAdresi: '',
    IlkSertifikaAlimTarihi: '2020-01-01',
    SertifikaBitisTarihi: '2030-01-01',
    YildizSayisi: 3,
    GuncellemeTarihi: '2026-01-01',
    SertifikaKapsami: null,
    KapsamDisi: null,
    AskiyaAlmaAciklama: null,
    Durum: '0',
    IptalAciklamasi: null,
    HanefiOk: true,
    HanbeliOk: true,
    SafiOk: true,
    MalikiOk: true,
    SertifikaResimleri: null,
    KapsamOnizleme: '',
    Rozet: 'normal',
    BarkodluUrunSayisi: 0,
    AramaIndex: null,
    IsletmeKayitNo: null,
    ...overrides,
  }
}

describe('durumSuggestsActive', () => {
  it('treats upstream code 0 as active', () => {
    expect(durumSuggestsActive(cert({ Durum: '0' }))).toBe(true)
  })

  it('treats Aktif text as active', () => {
    expect(durumSuggestsActive(cert({ Durum: 'Aktif' }))).toBe(true)
  })
})

describe('durumSuggestsSuspended', () => {
  it('treats upstream code -4 as suspended', () => {
    expect(durumSuggestsSuspended(cert({ Durum: '-4' }))).toBe(true)
  })

  it('does not treat active code 0 as suspended', () => {
    expect(durumSuggestsSuspended(cert({ Durum: '0' }))).toBe(false)
  })
})

describe('isCertSuspended', () => {
  it('does not suspend ALPEDO-like active cert with historical AskiyaAlmaAciklama', () => {
    const alpedo = cert({
      MarkaAdi: 'ALPEDO',
      Durum: '0',
      AskiyaAlmaAciklama:
        'GİMDES STANDARTLARINA AYKIRI DURUM TESPİTİYLE 08.08.2022 TARİHİNDE FİRMANIN SERTİFİKASI ASKIYA ALINMIŞTIR.',
    })
    expect(isCertSuspended(alpedo)).toBe(false)
    expect(getCertAlertKind(alpedo)).toBeNull()
  })

  it('suspends cert with Durum -4', () => {
    const suspended = cert({ Durum: '-4', AskiyaAlmaAciklama: null })
    expect(isCertSuspended(suspended)).toBe(true)
    expect(getCertAlertKind(suspended)).toBe('suspended')
  })

  it('suspends cert in askıya category with matching KategoriAdi', () => {
    const suspended = cert({
      Durum: '-2',
      KategoriAdi: 'ASKIYA ALINANLAR',
      AskiyaAlmaAciklama: null,
    })
    expect(isCertSuspended(suspended)).toBe(true)
  })

  it('does not mark cancelled cert as suspended', () => {
    const cancelled = cert({
      Durum: '-4',
      IptalAciklamasi: 'İptal edildi',
    })
    expect(isCertCancelled(cancelled)).toBe(true)
    expect(isCertSuspended(cancelled)).toBe(false)
    expect(getCertAlertKind(cancelled)).toBe('cancelled')
  })
})

describe('hasHistoricalSuspensionNote', () => {
  it('detects historical note on active cert', () => {
    const alpedo = cert({
      Durum: '0',
      AskiyaAlmaAciklama: '08.08.2022 tarihinde askıya alınmıştır.',
    })
    expect(hasHistoricalSuspensionNote(alpedo)).toBe(true)
  })

  it('returns false for currently suspended cert', () => {
    const suspended = cert({
      Durum: '-4',
      AskiyaAlmaAciklama: 'Askıda',
    })
    expect(hasHistoricalSuspensionNote(suspended)).toBe(false)
  })
})
