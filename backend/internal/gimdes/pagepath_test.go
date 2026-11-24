package gimdes

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestListIDFromPagePath(t *testing.T) {
	ok := map[string]int{
		"/KategoriListe/baharat--spices__5":                      5,
		"KategoriListe/-zel-g-dalar--special-foods__11/":         11,
		"https://gimdes.com/KategoriListe/bal--honey__7?lang=tr": 7,
		"/Kategori/IptalEdilenSertifikalar":                      -1,
		"/Kategori/SuresiGecenSertifikalar":                      -2,
		"/Kategori/YenilenmeyenSertifikalar":                     -3,
		"/Kategori/AskiyaAlinanSertifikalar":                     -4,
	}
	for in, want := range ok {
		if got, err := listIDFromPagePath(in); err != nil || got != want {
			t.Errorf("%q: got %d, %v; want %d", in, got, err, want)
		}
	}
	for _, in := range []string{"", "/", "/Hakkimizda", "/KategoriListe/x", "/KategoriListe/x__0", "/Kategori/Baska"} {
		if _, err := listIDFromPagePath(in); !errors.Is(err, ErrUnknownPagePath) {
			t.Errorf("%q: got %v, want ErrUnknownPagePath", in, err)
		}
	}
}

func serve(t *testing.T, wantPath, body string) *Client {
	t.Helper()
	s := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || r.URL.Path != wantPath {
			t.Errorf("got %s %s, want GET %s", r.Method, r.URL.Path, wantPath)
		}
		_, _ = w.Write([]byte(body))
	}))
	t.Cleanup(s.Close)
	return &Client{BaseURL: s.URL}
}

func TestCertificatesFromPage(t *testing.T) {
	c := serve(t, "/api/catLst/x--5", `[{"SertifikaId":1,"KategoriId":5,"FirmaAdresi":null}]`)
	list, err := c.CertificatesFromPage(context.Background(), "/KategoriListe/baharat--spices__5")
	if err != nil || len(list) != 1 {
		t.Fatalf("got %v, %v", list, err)
	}

	c = serve(t, "/api/catLst/x---4", `[{"SertifikaId":1,"KategoriId":5,"Durum":"-4"}]`)
	if _, err := c.CertificatesFromPage(context.Background(), "/Kategori/AskiyaAlinanSertifikalar"); err != nil {
		t.Fatal(err)
	}

	// A fallback to some other list must not be served as this category.
	c = serve(t, "/api/catLst/x--5", `[{"SertifikaId":1,"KategoriId":7}]`)
	if _, err := c.CertificatesFromPage(context.Background(), "/KategoriListe/baharat--spices__5"); err == nil {
		t.Fatal("expected mismatch error")
	}
}

func TestCertificatesByListPathUsesGET(t *testing.T) {
	c := serve(t, "/api/catLst/Son-Guncellenenler--0", `[]`)
	list, err := c.CertificatesByListPath(context.Background(), "")
	if err != nil || list == nil {
		t.Fatalf("got %v, %v", list, err)
	}
}
