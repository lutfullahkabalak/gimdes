package gimdes

// Category is returned by GET /api/kl
type Category struct {
	KategoriAdi      string `json:"KategoriAdi"`
	Id               int    `json:"Id"`
	SertifikaSayisi  int    `json:"SertifikaSayisi"`
	Href             string `json:"Href"`
	Icon             string `json:"Icon"`
}

// Certificate is one row from POST /api/catLst/... or embedded in category HTML.
type Certificate struct {
	KategoriAdi               string  `json:"KategoriAdi"`
	FirmaId                   int     `json:"FirmaId"`
	FirmaAdi                  string  `json:"FirmaAdi"`
	FirmaTelefon              string  `json:"FirmaTelefon"`
	FirmaWebSayfasi           *string `json:"FirmaWebSayfasi"`
	FirmaIletisimEmail        string  `json:"FirmaIletisimEmail"`
	FirmaIl                   string  `json:"FirmaIl"`
	FirmaUlke                 string  `json:"FirmaUlke"`
	SertifikaId               int     `json:"SertifikaId"`
	KategoriId                int     `json:"KategoriId"`
	MarkaAdi                  string  `json:"MarkaAdi"`
	MarkaLogosu               *string `json:"MarkaLogosu"`
	SertifikaNo               string  `json:"SertifikaNo"`
	FirmaAdresi               string  `json:"FirmaAdresi"`
	IlkSertifikaAlimTarihi    string  `json:"IlkSertifikaAlimTarihi"`
	SertifikaBitisTarihi      string  `json:"SertifikaBitisTarihi"`
	YildizSayisi              int     `json:"YildizSayisi"`
	GuncellemeTarihi          string  `json:"GuncellemeTarihi"`
	SertifikaKapsami          *string `json:"SertifikaKapsami"`
	KapsamDisi                *string `json:"KapsamDisi"`
	AskiyaAlmaAciklama        *string `json:"AskiyaAlmaAciklama"`
	Durum                     string  `json:"Durum"`
	IptalAciklamasi           *string `json:"IptalAciklamasi"`
	HanefiOk                  bool    `json:"HanefiOk"`
	HanbeliOk                 bool    `json:"HanbeliOk"`
	SafiOk                    bool    `json:"SafiOk"`
	MalikiOk                  bool    `json:"MalikiOk"`
	SertifikaResimleri        *string `json:"SertifikaResimleri"`
	KapsamOnizleme            string  `json:"KapsamOnizleme"`
	Rozet                     string  `json:"Rozet"`
	BarkodluUrunSayisi        int     `json:"BarkodluUrunSayisi"`
	AramaIndex                *string `json:"AramaIndex"`
	IsletmeKayitNo            *string `json:"IsletmeKayitNo"`

	// Enriched (not from upstream JSON)
	InScopeLines    []string `json:"in_scope_lines,omitempty"`
	OutOfScopeLines []string `json:"out_of_scope_lines,omitempty"`
}
