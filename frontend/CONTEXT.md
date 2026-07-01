# GİMDES Frontend — Proje Context

Nuxt 4 + Vue 3 + Nuxt UI ile GİMDES sertifika/marka arama ve listeleme arayüzü. Veri `gimdesapi` proxy backend üzerinden (`useGimdesApi`) gelir.

## Ana sayfalar

| Sayfa | Dosya | Açıklama |
|-------|-------|----------|
| Ana sayfa | `pages/index.vue` | Kategori seçici + marka kutucuk grid |
| Arama | `pages/arama.vue` | Metin araması sonuçları |
| Marka detay | `pages/marka/[sertifikaId].vue` | sessionStorage'dan sertifika detayı |

## Bileşenler

- `components/gimdes/GimdesBrandTile.vue` — Ana sayfa marka kutucuğu
- `components/gimdes/GimdesSearchResultRowSimple.vue` — Arama satırı
- `components/gimdes/GimdesSearchResultAccordion.vue` — Arama accordion satırı

## Yardımcılar

| Dosya | Rol |
|-------|-----|
| `utils/categoryIcon.ts` | Kategori adı → Lucide ikon |
| `utils/categoryColor.ts` | Kategori adı → Tailwind renk seti (shell, inner, logoPanel, badge) |
| `utils/certStatus.ts` | İptal / askı / süre dolumu tespiti ve kart yüzey sınıfları |
| `utils/logoUrl.ts` | Marka logosu URL |
| `composables/useGimdesApi.ts` | REST API çağrıları |
| `composables/useCachedLogo.ts` | Logo IndexedDB önbelleği |

## Tamamlanan tasklar

### Kategori bazlı marka kutucuğu renklendirme (2026-07-01)

- **Normal kartlar:** `KategoriAdi` ile orta yoğunluk gradient renk (`categoryColor.ts`); sol üst yuvarlak rozet içinde kategori ikonu.
- **Sorunlu kartlar:** Mevcut kırmızı/amber tam kart renkleri korundu; durum etiketi sağ üst yuvarlak metin rozeti (çok satırlı, örn. "Süresi geçmiş").
- **Kapsam dışı:** Arama sonuçları (sonra ele alınacak).

### ALPEDO yanlış "Askıda" etiketi düzeltmesi (2026-07-01)

- **Sorun:** Upstream `Durum: "0"` (aktif) iken geçmiş `AskiyaAlmaAciklama` metni kaldığında (ör. ALPEDO 2022 askısı) ana sayfada yanlış "Askıda" rozeti.
- **Çözüm:** `certStatus.ts` — askı tespiti birincil olarak `Durum === "-4"`; aktif (`0` / `Aktif`) kayıtlarda `AskiyaAlmaAciklama` yok sayılır.
- **Detay sayfası:** Geçmiş askı notu nötr "Geçmiş askı kaydı" uyarısı olarak gösterilir.
- **Testler:** `utils/certStatus.test.ts` (vitest).

## API

OpenAPI: backend `cmd/server/docs/openapi.yaml`. Skill: `.cursor/skills/gimdes-frontend-api/SKILL.md`.
