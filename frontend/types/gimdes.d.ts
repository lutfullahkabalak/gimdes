export interface Category {
  KategoriAdi: string
  Id: number
  SertifikaSayisi: number
  Href: string
  Icon: string
}

export interface Certificate {
  KategoriAdi: string
  FirmaId: number
  FirmaAdi: string
  FirmaTelefon: string
  FirmaWebSayfasi: string | null
  FirmaIletisimEmail: string
  FirmaIl: string
  FirmaUlke: string
  SertifikaId: number
  KategoriId: number
  MarkaAdi: string
  MarkaLogosu: string | null
  SertifikaNo: string
  FirmaAdresi: string
  IlkSertifikaAlimTarihi: string
  SertifikaBitisTarihi: string
  YildizSayisi: number
  GuncellemeTarihi: string
  SertifikaKapsami: string | null
  KapsamDisi: string | null
  AskiyaAlmaAciklama: string | null
  Durum: string
  IptalAciklamasi: string | null
  HanefiOk: boolean
  HanbeliOk: boolean
  SafiOk: boolean
  MalikiOk: boolean
  SertifikaResimleri: string | null
  KapsamOnizleme: string
  Rozet: string
  BarkodluUrunSayisi: number
  AramaIndex: string | null
  IsletmeKayitNo: string | null
  in_scope_lines?: string[]
  out_of_scope_lines?: string[]
}
