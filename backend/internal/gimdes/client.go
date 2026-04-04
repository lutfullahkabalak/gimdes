package gimdes

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const DefaultBaseURL = "https://gimdes.com"

// Client calls the public GİMDES site APIs.
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

func (c *Client) base() string {
	if c.BaseURL != "" {
		return strings.TrimRight(c.BaseURL, "/")
	}
	return DefaultBaseURL
}

func (c *Client) httpClient() *http.Client {
	if c.HTTPClient != nil {
		return c.HTTPClient
	}
	return &http.Client{Timeout: 45 * time.Second}
}

// Categories calls GET /api/kl or /api/kl/{filter}
func (c *Client) Categories(ctx context.Context, filter string) ([]Category, error) {
	var u string
	if strings.TrimSpace(filter) == "" {
		u = c.base() + "/api/kl"
	} else {
		u = c.base() + "/api/kl/" + url.PathEscape(filter)
	}
	return jsonGet[[]Category](ctx, c.httpClient(), u)
}

// Search calls GET /api/s/{query}
func (c *Client) Search(ctx context.Context, query string) ([]Certificate, error) {
	q := strings.TrimSpace(query)
	if q == "" {
		return nil, fmt.Errorf("empty search query")
	}
	u := c.base() + "/api/s/" + url.PathEscape(q)
	return jsonGet[[]Certificate](ctx, c.httpClient(), u)
}

// CertificatesByListPath calls POST /api/catLst/{path} (e.g. Son-Guncellenenler--0).
func (c *Client) CertificatesByListPath(ctx context.Context, path string) ([]Certificate, error) {
	p := strings.Trim(path, "/")
	if p == "" {
		p = "Son-Guncellenenler--0"
	}
	u := c.base() + "/api/catLst/" + url.PathEscape(p)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, strings.NewReader(""))
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "gimdesapi/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient().Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 32<<20))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("upstream POST %s: %s — %s", u, resp.Status, truncate(string(body), 200))
	}
	var out []Certificate
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, fmt.Errorf("decode certificates: %w", err)
	}
	return out, nil
}

func jsonGet[T any](ctx context.Context, hc *http.Client, u string) (T, error) {
	var zero T
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return zero, err
	}
	req.Header.Set("User-Agent", "gimdesapi/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := hc.Do(req)
	if err != nil {
		return zero, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 8<<20))
	if err != nil {
		return zero, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return zero, fmt.Errorf("upstream GET %s: %s — %s", u, resp.Status, truncate(string(body), 200))
	}
	var out T
	if err := json.Unmarshal(body, &out); err != nil {
		return zero, fmt.Errorf("decode json: %w", err)
	}
	return out, nil
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}
