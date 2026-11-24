package gimdes

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

// ErrUnknownPagePath marks a page_path that is not a known category or status list.
var ErrUnknownPagePath = errors.New("unknown page_path")

var categoryPathRE = regexp.MustCompile(`(?i)^/KategoriListe/.*__([1-9]\d*)$`)

// statusListIDs maps status pages to the Durum code, which doubles as the list id upstream.
var statusListIDs = map[string]int{
	"/kategori/iptaledilensertifikalar":  -1,
	"/kategori/suresigecensertifikalar":  -2,
	"/kategori/yenilenmeyensertifikalar": -3,
	"/kategori/askiyaalinansertifikalar": -4,
}

// listIDFromPagePath extracts the catLst id from a category Href.
func listIDFromPagePath(pagePath string) (int, error) {
	raw := strings.TrimSpace(pagePath)
	if u, err := url.Parse(raw); err == nil {
		raw = u.Path
	}
	p := "/" + strings.Trim(raw, "/")
	if id, ok := statusListIDs[strings.ToLower(p)]; ok {
		return id, nil
	}
	if m := categoryPathRE.FindStringSubmatch(p); m != nil {
		if id, err := strconv.Atoi(m[1]); err == nil {
			return id, nil
		}
	}
	return 0, fmt.Errorf("%w: %q", ErrUnknownPagePath, pagePath)
}

// CertificatesFromPage returns the certificates of a category or status page
// (e.g. /KategoriListe/baharat--spices__5) via GET /api/catLst/x--{id}.
//
// Upstream splits the path on "--" and silently falls back to the recently
// updated list when it cannot read an id, so the slug is never forwarded and
// every returned row is checked against the requested list.
func (c *Client) CertificatesFromPage(ctx context.Context, pagePath string) ([]Certificate, error) {
	id, err := listIDFromPagePath(pagePath)
	if err != nil {
		return nil, err
	}
	list, err := c.CertificatesByListPath(ctx, "x--"+strconv.Itoa(id))
	if err != nil {
		return nil, err
	}
	for _, cert := range list {
		if (id > 0 && cert.KategoriId != id) || (id < 0 && cert.Durum != strconv.Itoa(id)) {
			return nil, fmt.Errorf("upstream returned certificate %d outside list %d", cert.SertifikaId, id)
		}
	}
	return list, nil
}
