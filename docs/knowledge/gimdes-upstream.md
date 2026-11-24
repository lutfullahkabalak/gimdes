# gimdes.com veri kaynağı

2026-11-24'te canlı siteye karşı doğrulandı. gimdes.com yeniden yazıldı; resmi API dokümanı yok.

| İhtiyaç | İstek |
|---|---|
| Kategoriler | `GET /api/kl` |
| Arama | `GET /api/s/{q}` |
| Son güncellenenler | `GET /api/catLst/Son-Guncellenenler--0` |
| Kategori | `GET /api/catLst/x--{KategoriId}` |
| Durum listesi | `GET /api/catLst/x--{Durum}` (ör. askıda: `x---4`) |
| Görseller | `https://gimnet.gimdes.com/Upload/{yol}` |

- `POST /api/catLst` artık 405 döner. Sayfalardaki `setCert({...})` JSON'u kaldırıldı; HTML ayrıştırma bu yüzden silindi.
- `catLst` yolu `--` ile bölünür. Kategori slug'ında da `--` olduğundan slug gönderilirse kimlik okunamaz ve **hatasız biçimde "son güncellenenler" döner**. Bu yüzden `x--{id}` kullanılır ve dönen satırlar kategoriye göre denetlenir (`backend/internal/gimdes/pagepath.go`).
- `Durum`: `0` geçerli, `-1` iptal, `-2` süresi geçmiş, `-3` yenilenmeyecek, `-4` askıda, `-5` yenileme sürecinde. `IptalAciklamasi` doluysa arayüz koddan bağımsız iptal sayar (ihtiyatlı kural, `frontend/utils/certStatus.ts`).
- `/api/kl` içindeki `SertifikaSayisi`, listedeki kayıt sayısından büyük olabilir (ör. Bal 27/24); sitenin kendi sayfasında da böyle, hata değil.
- Eski logo `/Content/images/gimdes-logo.png` 404. `/images/helal-logo-g.png` beyazdır, açık zeminde görünmez; `/images/pwa/ikon-192.png` kullanılır.
- Kullanılmayan diğer uçlar: `/Sertifika/Detay/{id}` (HTML parça), `/api/dogrula/{...}`.
