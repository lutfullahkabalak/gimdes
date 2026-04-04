---
name: gimdes-frontend-api
description: >-
  GİMDES proxy backend (gimdesapi) ile frontend geliştirirken kullan. REST JSON
  uçları, sorgu parametreleri, TypeScript tipleri, örnek fetch ve tipik ekran
  akışları. OpenAPI: /openapi.yaml (çalışan sunucuda).
---

# GİMDES proxy API — frontend / agent referansı

Bu skill, **bu repodaki Go sunucusunun** (`backend/cmd/server`) ürettiği JSON API’yi tüketmek için yazıldı. Veri kaynağı [gimdes.com](https://gimdes.com/) kamu sitesidir; sunucu proxy + metin zenginleştirmesi yapar. Çalıştırma: `cd backend && go run ./cmd/server`.

## Ne zaman kullan

- Helal sertifika / kategori / firma / marka arayüzü kodlarken
- `fetch` / React Query / SWR / axios ile entegrasyon planlarken
- Başka bir AI’a “bu API’ye göre UI üret” dendiğinde **bu dosyayı veya özetini** bağlam olarak ver

## Temel bilgiler

| Öğe | Değer |
|-----|--------|
| Kimlik doğrulama | Yok |
| Varsayılan base URL (dev) | `http://localhost:8080` |
| CORS | `Access-Control-Allow-Origin: *`, `GET` ve `OPTIONS` |
| JSON | UTF-8; `Content-Type: application/json` |
| Makine okunur tam şema | `GET {base}/openapi.yaml` (OpenAPI 3.1) |
| İnsan UI | `GET {base}/swagger` |

Ortam değişkeni `ADDR` farklıysa base URL’i buna göre değiştir (örn. `http://localhost:9287`).

## Ortak sorgu parametresi: `enrich`

- **Varsayılan:** açık (parametre yok veya `enrich` ≠ `0` / `false` / `no`).
- **Etki:** Sadece **`/v1/search`** ve **`/v1/certificates`** yanıtlarında her kayıt için sunucu, HTML alanlarından türetilmiş diziler ekler:
  - `in_scope_lines` ← `SertifikaKapsami`
  - `out_of_scope_lines` ← `KapsamDisi`
- Kapatmak için: `?enrich=false` veya `enrich=0` veya `enrich=no`.

## Uç noktalar (özet)

Tümü **GET** (preflight için `OPTIONS` CORS’ta 204).

| Yol | Amaç |
|-----|------|
| `/health` | Sağlık |
| `/v1/categories` | Kategori listesi |
| `/categories` | `/v1/categories` ile aynı |
| `/v1/search` | Metin araması (min 3 karakter) |
| `/v1/certificates` | Sertifika listesi (`list_path` veya `page_path`) |

**Not:** Sunucu sondaki `/` karakterini kırpar; `/v1/categories/` da çalışır.

---

### GET `/health`

**Yanıt 200:** `{ "ok": true }`

---

### GET `/v1/categories` (veya `/categories`)

**Query**

- `filter` (opsiyonel): string. Boşsa tüm kategoriler; doluysa upstream filtre segmenti (`/api/kl/{filter}`).

**Yanıt 200:** `Category[]`

**Hata 502:** `{ "error": "..." }` — upstream veya ağ.

---

### GET `/v1/search`

**Query**

- `q` (**zorunlu**): arama metni. Sunucu **trim sonrası uzunluk &lt; 3** ise **400**.
- `enrich` (opsiyonel): yukarıdaki gibi.

**Yanıt 200:** `Certificate[]`

**Hata 400 / 502:** `{ "error": "..." }`

---

### GET `/v1/certificates`

**Query (bir mod seç — ikisini birden verme)**

1. **`list_path`** (opsiyonel): upstream liste anahtarı. Boşsa varsayılan `Son-Guncellenenler--0`. Sunucu upstream’e `POST /api/catLst/{list_path}` benzeri çağrı yapar.
2. **`page_path`** (opsiyonel): gimdes.com’daki **tam yol**, örn. kategori `Href`: `/KategoriListe/baharat--spices__5`. Sunucu ilgili HTML’i çeker, içindeki `setCert({...})` JSON’larını çıkarır. **Büyük sayfalar** için süre ~60 sn timeout; UI’da yükleme göstergesi kullan.

**Yasak:** `list_path` ve `page_path` birlikte → **400**.

**`enrich`:** opsiyonel, yukarıdaki gibi.

**Yanıt 200:** `Certificate[]`

**Hata 400 / 502:** `{ "error": "..." }`

---

## TypeScript tipleri (frontend için)

Aşağıdaki alan adları **sunucunun döndürdüğü JSON ile birebir** aynıdır (PascalCase upstream uyumu).

```typescript
/** Kategori satırı — GET /v1/categories */
export interface Category {
  KategoriAdi: string;
  Id: number;
  SertifikaSayisi: number;
  Href: string; // örn. "/KategoriListe/baharat--spices__5"
  Icon: string;
}

/** Sertifika / marka / firma — search veya certificates */
export interface Certificate {
  KategoriAdi: string;
  FirmaId: number;
  FirmaAdi: string;
  FirmaTelefon: string;
  FirmaWebSayfasi: string | null;
  FirmaIletisimEmail: string;
  FirmaIl: string;
  FirmaUlke: string;
  SertifikaId: number;
  KategoriId: number;
  MarkaAdi: string;
  MarkaLogosu: string | null;
  SertifikaNo: string;
  FirmaAdresi: string;
  IlkSertifikaAlimTarihi: string;
  SertifikaBitisTarihi: string;
  YildizSayisi: number;
  GuncellemeTarihi: string;
  SertifikaKapsami: string | null; // HTML
  KapsamDisi: string | null; // HTML
  AskiyaAlmaAciklama: string | null;
  Durum: string;
  IptalAciklamasi: string | null;
  HanefiOk: boolean;
  HanbeliOk: boolean;
  SafiOk: boolean;
  MalikiOk: boolean;
  SertifikaResimleri: string | null; // JSON string
  KapsamOnizleme: string;
  Rozet: string;
  BarkodluUrunSayisi: number;
  AramaIndex: string | null;
  IsletmeKayitNo: string | null;
  /** enrich açıkken */
  in_scope_lines?: string[];
  /** enrich açıkken */
  out_of_scope_lines?: string[];
}

export interface ApiError {
  error: string;
}
```

**Logo görseli (UI):** `MarkaLogosu` göreli yol ise tam URL genelde  
`https://gimnet.gimdes.com/Upload/{MarkaLogosu}` şeklinde kullanılır (gimdes sitesiyle uyumlu).

---

## Örnek `fetch` (tarayıcı / RN)

```typescript
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function getCategories(): Promise<Category[]> {
  const r = await fetch(`${BASE}/v1/categories`);
  if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
  return r.json();
}

async function getCertificatesByCategoryHref(href: string): Promise<Certificate[]> {
  const u = new URL(`${BASE}/v1/certificates`);
  u.searchParams.set("page_path", href); // "/KategoriListe/..." ile başlamalı
  const r = await fetch(u);
  if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
  return r.json();
}

async function searchCertificates(q: string): Promise<Certificate[]> {
  const u = new URL(`${BASE}/v1/search`);
  u.searchParams.set("q", q.trim());
  const r = await fetch(u);
  if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
  return r.json();
}
```

---

## Önerilen ekran akışları

1. **Kategori gezgini:** `GET /v1/categories` → liste; her `Href` ile `GET /v1/certificates?page_path={encodeURIComponent(Href)}`.
2. **Son güncellenenler:** `GET /v1/certificates` (parametre yok veya `list_path=Son-Guncellenenler--0`).
3. **Arama:** kullanıcı 3+ karakter girince `GET /v1/search?q=...`; kısa metinde API’yi çağırma, yerelde uyarı göster.
4. **Detay kartı:** tek `Certificate` objesini göster; kapsam için önce `in_scope_lines` / `out_of_scope_lines`, yoksa ham `SertifikaKapsami` / `KapsamDisi` (HTML ise `dangerouslySetInnerHTML` yerine sanitize veya düz metin tercih et).

---

## Sınırlar (ürün tasarımı)

- Barkodlu **tek tek SKU listesi** bu proxy’de yok; yalnızca **`BarkodluUrunSayisi`** ve kapsam metinleri var.
- `page_path` ile gelen liste, gimdes HTML sırasına bağlı olabilir; sayfa çekilemezse 502.

---

## Agent checklist

- [ ] `BASE` URL’i ortama göre ayarlandı mı?
- [ ] Arama için `q` uzunluğu ≥ 3 mü?
- [ ] Kategori detayı için `page_path` tam yol mu (`/` ile başlıyor mu)?
- [ ] `list_path` + `page_path` aynı istekte birlikte kullanılmıyor mu?
- [ ] Hata gövdesi `{ error: string }` olarak parse ediliyor mu?
