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

- `components/gimdes/GimdesSiteHeader.vue` — Sabit üst çubuk; arama sayfasında arama kutusunu taşır
- `components/gimdes/GimdesStatusPill.vue`, `GimdesBrandLogo.vue`, `GimdesScopeList.vue` — Ortak durum, logo, kapsam satırı

## Tasarım ilkeleri (2026-11-24)

- Kullanıcı canlı renkli ve şaşırtıcı bir görünüm istedi; sade sürüm `5d1e9d3` commit'indedir.
- Giyoş rozeti ve detay mührü tüm sayfalarda gizlidir (`utils/features.ts`; kullanıcı denedi, yakıştırmadı). Ana sayfada "Geçerli" etiketi gösterilmez, diğer durumlar gösterilir (kullanıcı kararı) (`GimdesRosette.vue`, canvas): deseni metinden üretir, aramada yazdıkça dönüşür; marka detayında sertifika numarasından gelir.
- Renk kategoriyi anlatır (`utils/categoryPalette.ts`), geçersiz kayıt rengini kaybeder (gri). Durum her zaman yazıyla da verilir (`GimdesStatusPill`, `GimdesSeal`). Mühür bir durum grafiğidir, resmî GİMDES mührü taklidi değildir.
- `font-display` birleşik harf kullanmaz; "fi" Türkçede i noktasını yutuyordu.
- Ham upstream değeri gösterilmez: durum kodu etikete, ISO tarih GG.AA.YYYY'ye, iki dilli kategori Türkçe ada çevrilir; 0001 tarihleri "Belirtilmemiş".
- Geçersiz sertifikanın kapsamında onay işareti yoktur. Kapsam dışı arama eşleşmesi kırmızı ve açık yazılır.
- Renk ve yazı tipi belirteçleri `assets/css/main.css` içindedir (Bricolage Grotesque + Hanken Grotesk, `@nuxt/fonts` derlemede indirir).

- Hareket: `--ease-soft`, `animate-rise`, `animate-appear`, `gimdes-stagger`, `gimdes-press` (`main.css`). Sayfalar arası View Transitions açık. Yeni içerik, eskinin çıkış animasyonunu beklemez (`mode="out-in"` gizli sekmede içeriği takılı bırakmıştı). `animation-fill-mode: backwards` kullanılır; `both` hover dönüşümünü ezebilir.

- Geri dönülen ana sayfada belirme animasyonları oynamaz (`gimdes-still`) ve logolar bellekten ilk karede gelir (`useCachedLogo` açık blob adresleri). Aksi hâlde uçan logo yerine otururken beyaz bir an oluşuyordu.

- PWA: `public/manifest.webmanifest`, ikonlar `public/icons/` (Codex ile üretildi; maskable sürümü geniş boşlukludur). iOS ana ekran ikonu yalnızca uygulama yeniden eklenince değişir.
- iOS kenardan kaydırarak geri dönüşte görsel geçişi sistem yapar (`hasUAVisualTransition`); Nuxt View Transition'ı bilerek atlar. Üstüne logo uçuşu eklenirse sayfa yerine oturduktan sonra ikinci kez oynar.

## Yardımcılar

| Dosya | Rol |
|-------|-----|
| `utils/categoryIcon.ts` | Kategori adı → Lucide ikon |
| `utils/certDisplay.ts` | Durum etiketi/tonu, tarih, kategori adı ve web adresi gösterimi |
| `utils/certStatus.ts` | İptal / askı / süre dolumu tespiti |
| `utils/logoUrl.ts` | Marka logosu URL |
| `composables/useGimdesApi.ts` | REST API çağrıları |
| `composables/useCachedLogo.ts` | Logo IndexedDB önbelleği |

## Tamamlanan tasklar

### ALPEDO yanlış "Askıda" etiketi düzeltmesi (2026-07-01)

- **Sorun:** Upstream `Durum: "0"` (aktif) iken geçmiş `AskiyaAlmaAciklama` metni kaldığında (ör. ALPEDO 2022 askısı) ana sayfada yanlış "Askıda" rozeti.
- **Çözüm:** `certStatus.ts` — askı tespiti birincil olarak `Durum === "-4"`; aktif (`0` / `Aktif`) kayıtlarda `AskiyaAlmaAciklama` yok sayılır.
- **Detay sayfası:** Geçmiş askı notu nötr "Geçmiş askı kaydı" uyarısı olarak gösterilir.
- **Testler:** `utils/certStatus.test.ts` (vitest).

## API

OpenAPI: backend `cmd/server/docs/openapi.yaml`. Skill: `.cursor/skills/gimdes-frontend-api/SKILL.md`.
