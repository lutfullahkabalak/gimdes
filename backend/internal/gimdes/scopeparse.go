package gimdes

import (
	"html"
	"regexp"
	"strings"
)

var tagRE = regexp.MustCompile(`(?i)<[^>]+>`)

// LinesFromScopeHTML turns SertifikaKapsami / KapsamDisi HTML into trimmed non-empty lines.
func LinesFromScopeHTML(s *string) []string {
	if s == nil {
		return nil
	}
	t := *s
	if strings.TrimSpace(t) == "" {
		return nil
	}
	t = strings.ReplaceAll(t, "\r\n", "\n")
	t = strings.ReplaceAll(t, "\r", "\n")
	t = strings.ReplaceAll(t, "<br>", "\n")
	t = strings.ReplaceAll(t, "<br/>", "\n")
	t = strings.ReplaceAll(t, "<br />", "\n")
	t = strings.ReplaceAll(t, "</p>", "\n")
	t = strings.ReplaceAll(t, "<p>", "\n")
	t = tagRE.ReplaceAllString(t, "\n")
	t = html.UnescapeString(t)
	var out []string
	for _, line := range strings.Split(t, "\n") {
		line = strings.TrimSpace(line)
		if line != "" {
			out = append(out, line)
		}
	}
	return out
}

// EnrichCertificate fills InScopeLines / OutOfScopeLines from HTML fields.
func EnrichCertificate(c *Certificate) {
	c.InScopeLines = LinesFromScopeHTML(c.SertifikaKapsami)
	c.OutOfScopeLines = LinesFromScopeHTML(c.KapsamDisi)
	c.CertificateImages = CertificateImagesFromResimleri(c.SertifikaResimleri)
}
