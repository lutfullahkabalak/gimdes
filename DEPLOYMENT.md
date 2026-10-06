# Tek domain ile yayın

Site adresi `https://gimdes.abapnews.tr/` olarak kalır. Nginx, sayfaları
Nuxt'a, `/v1/` API isteklerini Go servisine yönlendirir. Tarayıcı API için
aynı domaini kullanır; ayrı API domaini veya API portu gerekmez.

## Cloudflare Tunnel / Portainer

Mevcut HTTPS ve Cloudflare Tunnel yapılandırmasını koruyun. Public Hostname
`gimdes.abapnews.tr` için servis hedefi `http://localhost:1300` olmalıdır.
Tunnel ayrı bir container içinde aynı Docker ağındaysa hedef `http://nginx:80`
olabilir. Mevcut özel port kullanılıyorsa `GIMDES_FRONTEND_PUBLISH_PORT` ile
aynı portu koruyun.

GitHub Actions artık backend, frontend ve nginx imajlarını yayınlar. Üç
imajın da ilgili sürümü yayınlandıktan sonra Portainer'daki stack içeriğini
`docker-compose.ghcr.yml` ile güncelleyin ve yeni imajları çekerek yeniden
deploy edin. Yalnızca imajları yenilemek yeni Nginx servisini eklemez.

Sunucuda CLI ile:

```sh
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d --remove-orphans
```

`GIMDES_PUBLIC_API_BASE` artık kullanılmaz. Frontend'in
`NUXT_PUBLIC_API_BASE` değeri boş bırakılır. Nginx mevcut Tunnel'ın arkasında
HTTP dinler; HTTPS mevcut dış katmanda sonlandırılmaya devam eder.

## Kaynak koddan çalıştırma

```sh
docker compose up -d --build
```

Yerel giriş noktası: `http://localhost:1300`.

## Yayın kontrolü

```sh
curl --fail https://gimdes.abapnews.tr/health
curl --fail https://gimdes.abapnews.tr/v1/categories
```

Ana sayfada kategori seçimi ve arama aynı domain üzerinden çalışmalıdır.
Eski API hostname'i başka istemcilerce kullanılıyorsa kaldırılmadan önce
bu istemciler ayrıca güncellenmelidir.
