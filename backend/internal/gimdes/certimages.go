package gimdes

import (
	"encoding/json"
	"strings"
)

const gimnetUploadBase = "https://gimnet.gimdes.com/Upload/"

// CertificateImage is derived from upstream SertifikaResimleri (JSON array string).
type CertificateImage struct {
	Filename     string `json:"filename"`
	OriginalName string `json:"original_name"`
	URL          string `json:"url"`
}

type certImageFile struct {
	Filename     string `json:"Filename"`
	OriginalName string `json:"OriginalName"`
}

func uploadURL(filename string) string {
	f := strings.TrimSpace(filename)
	if f == "" {
		return ""
	}
	if strings.HasPrefix(f, "http://") || strings.HasPrefix(f, "https://") {
		return f
	}
	return gimnetUploadBase + strings.TrimPrefix(f, "/")
}

// CertificateImagesFromResimleri parses the upstream JSON string into image rows with CDN URLs.
func CertificateImagesFromResimleri(s *string) []CertificateImage {
	if s == nil {
		return nil
	}
	raw := strings.TrimSpace(*s)
	if raw == "" {
		return nil
	}
	var files []certImageFile
	if err := json.Unmarshal([]byte(raw), &files); err != nil {
		return nil
	}
	var out []CertificateImage
	for _, f := range files {
		fn := strings.TrimSpace(f.Filename)
		if fn == "" {
			continue
		}
		u := uploadURL(fn)
		if u == "" {
			continue
		}
		out = append(out, CertificateImage{
			Filename:     fn,
			OriginalName: strings.TrimSpace(f.OriginalName),
			URL:          u,
		})
	}
	if len(out) == 0 {
		return nil
	}
	return out
}
