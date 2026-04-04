// GİMDES proxy API: categories, certificate lists, search, and scope parsing.
package main

import (
	"context"
	"embed"
	"encoding/json"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"gimdesapi/internal/gimdes"
)

//go:embed docs/*
var docsFS embed.FS

func main() {
	base := os.Getenv("GIMDES_BASE_URL")
	if base == "" {
		base = gimdes.DefaultBaseURL
	}
	addr := os.Getenv("ADDR")
	if addr == "" {
		addr = ":8080"
	}

	client := &gimdes.Client{BaseURL: base}

	openapiYAML, err := docsFS.ReadFile("docs/openapi.yaml")
	if err != nil {
		log.Fatal(err)
	}
	swaggerHTML, err := docsFS.ReadFile("docs/swagger.html")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	swaggerUISub, err := fs.Sub(docsFS, "docs/swagger-ui")
	if err != nil {
		log.Fatal("swagger-ui assets (docs/swagger-ui/*): ", err)
	}
	mux.Handle("/swagger-ui/", http.StripPrefix("/swagger-ui/", http.FileServer(http.FS(swaggerUISub))))

	mux.HandleFunc("GET /openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
		_, _ = w.Write(openapiYAML)
	})
	serveSwagger := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(swaggerHTML)
	}
	mux.HandleFunc("GET /swagger", serveSwagger)
	mux.HandleFunc("GET /swagger/", serveSwagger)

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true}`))
	})
	listCategories := func(w http.ResponseWriter, r *http.Request) {
		filter := r.URL.Query().Get("filter")
		list, err := client.Categories(r.Context(), filter)
		if err != nil {
			jsonError(w, http.StatusBadGateway, err.Error())
			return
		}
		writeJSON(w, list)
	}
	mux.HandleFunc("GET /v1/categories", listCategories)
	mux.HandleFunc("GET /categories", listCategories)
	mux.HandleFunc("GET /v1/search", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query().Get("q")
		if len(strings.TrimSpace(q)) < 3 {
			jsonError(w, http.StatusBadRequest, "query parameter q is required (min 3 characters, matching upstream)")
			return
		}
		list, err := client.Search(r.Context(), q)
		if err != nil {
			jsonError(w, http.StatusBadGateway, err.Error())
			return
		}
		if enrich(r) {
			for i := range list {
				gimdes.EnrichCertificate(&list[i])
			}
		}
		writeJSON(w, list)
	})
	mux.HandleFunc("GET /v1/certificates", func(w http.ResponseWriter, r *http.Request) {
		listPath := strings.TrimSpace(r.URL.Query().Get("list_path"))
		pagePath := strings.TrimSpace(r.URL.Query().Get("page_path"))
		if listPath != "" && pagePath != "" {
			jsonError(w, http.StatusBadRequest, "use either list_path or page_path, not both")
			return
		}
		var (
			list []gimdes.Certificate
			err  error
		)
		switch {
		case pagePath != "":
			ctx, cancel := context.WithTimeout(r.Context(), 60*time.Second)
			defer cancel()
			list, err = client.CertificatesFromPage(ctx, pagePath)
		default:
			if listPath == "" {
				listPath = "Son-Guncellenenler--0"
			}
			list, err = client.CertificatesByListPath(r.Context(), listPath)
		}
		if err != nil {
			jsonError(w, http.StatusBadGateway, err.Error())
			return
		}
		if enrich(r) {
			for i := range list {
				gimdes.EnrichCertificate(&list[i])
			}
		}
		writeJSON(w, list)
	})

	log.Printf("listening on %s (upstream %s) — Swagger UI: http://localhost%s/swagger", addr, base, addr)
	s := &http.Server{
		Addr:              addr,
		Handler:           withCORS(stripTrailingSlash(mux)),
		ReadHeaderTimeout: 10 * time.Second,
	}
	if err := s.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func enrich(r *http.Request) bool {
	v := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("enrich")))
	if v == "0" || v == "false" || v == "no" {
		return false
	}
	return true
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(v); err != nil {
		log.Printf("encode json: %v", err)
	}
}

func jsonError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// stripTrailingSlash makes /v1/categories/ match /v1/categories (Go ServeMux is strict).
func stripTrailingSlash(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if len(path) > 1 && path[len(path)-1] == '/' {
			u := *r.URL
			u.Path = strings.TrimSuffix(path, "/")
			r.URL = &u
		}
		next.ServeHTTP(w, r)
	})
}
