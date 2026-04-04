export default defineNuxtConfig({
  compatibilityDate: '2026-04-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: {
        class: 'light',
      },
    },
  },
  ui: {
    colorMode: false,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
    },
  },
  vite: {
    server: {
      proxy: {
        '/v1': { target: 'http://localhost:8080', changeOrigin: true },
        '/health': { target: 'http://localhost:8080', changeOrigin: true },
        '/categories': { target: 'http://localhost:8080', changeOrigin: true },
      },
    },
  },
})
