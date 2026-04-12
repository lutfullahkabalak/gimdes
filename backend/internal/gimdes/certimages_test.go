package gimdes

import (
	"testing"
)

func TestCertificateImagesFromResimleri(t *testing.T) {
	raw := `[{"Filename":"HelalSertifika/00001/x.jpg","OriginalName":"doc.jpg"}]`
	got := CertificateImagesFromResimleri(&raw)
	if len(got) != 1 {
		t.Fatalf("len=%d", len(got))
	}
	if got[0].URL != "https://gimnet.gimdes.com/Upload/HelalSertifika/00001/x.jpg" {
		t.Fatalf("url=%q", got[0].URL)
	}
	if got[0].OriginalName != "doc.jpg" || got[0].Filename != "HelalSertifika/00001/x.jpg" {
		t.Fatalf("%+v", got[0])
	}
}

func TestCertificateImagesFromResimleri_nil(t *testing.T) {
	if CertificateImagesFromResimleri(nil) != nil {
		t.Fatal("expected nil")
	}
}
