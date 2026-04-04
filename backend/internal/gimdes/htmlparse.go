package gimdes

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"golang.org/x/net/html"
)

// CertificatesFromPage fetches an HTML page (e.g. /KategoriListe/baharat--spices__5) and
// extracts certificate objects embedded in ng-click="setCert({...})".
func (c *Client) CertificatesFromPage(ctx context.Context, pagePath string) ([]Certificate, error) {
	p := strings.TrimSpace(pagePath)
	if !strings.HasPrefix(p, "/") {
		p = "/" + p
	}
	u := c.base() + p
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "gimdesapi/1.0")

	hc := c.httpClient()
	resp, err := hc.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 40<<20))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("fetch page %s: %s", u, resp.Status)
	}
	return extractSetCerts(body)
}

func extractSetCerts(htmlDoc []byte) ([]Certificate, error) {
	doc, err := html.Parse(bytes.NewReader(htmlDoc))
	if err != nil {
		return nil, err
	}
	seen := make(map[int]struct{})
	var list []Certificate
	var walk func(*html.Node)
	walk = func(n *html.Node) {
		if n.Type == html.ElementNode {
			for _, a := range n.Attr {
				if a.Key != "ng-click" {
					continue
				}
				jsonStr, ok := extractSetCertJSON(a.Val)
				if !ok {
					continue
				}
				var cert Certificate
				if err := json.Unmarshal([]byte(jsonStr), &cert); err != nil {
					continue
				}
				if cert.SertifikaId == 0 {
					continue
				}
				if _, dup := seen[cert.SertifikaId]; dup {
					continue
				}
				seen[cert.SertifikaId] = struct{}{}
				list = append(list, cert)
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(doc)
	return list, nil
}

func extractSetCertJSON(ngClick string) (string, bool) {
	const prefix = "setCert("
	i := strings.Index(ngClick, prefix)
	if i < 0 {
		return "", false
	}
	i += len(prefix)
	for i < len(ngClick) && ngClick[i] != '{' {
		i++
	}
	if i >= len(ngClick) || ngClick[i] != '{' {
		return "", false
	}
	end := balancedObjectEnd(ngClick, i)
	if end < 0 {
		return "", false
	}
	return ngClick[i : end+1], true
}

func balancedObjectEnd(s string, open int) int {
	if open >= len(s) || s[open] != '{' {
		return -1
	}
	depth := 0
	inString := false
	escape := false
	for i := open; i < len(s); i++ {
		ch := s[i]
		if inString {
			if escape {
				escape = false
				continue
			}
			if ch == '\\' {
				escape = true
				continue
			}
			if ch == '"' {
				inString = false
			}
			continue
		}
		if ch == '"' {
			inString = true
			continue
		}
		if ch == '{' {
			depth++
			continue
		}
		if ch == '}' {
			depth--
			if depth == 0 {
				return i
			}
		}
	}
	return -1
}
