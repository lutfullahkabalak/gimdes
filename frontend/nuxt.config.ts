export default defineNuxtConfig({
  compatibilityDate: '2026-04-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  experimental: {
    viewTransition: true,
  },
  app: {
    head: {
      htmlAttrs: {
        class: 'light',
        lang: 'tr',
      },
      title: 'GİMDES Helal Sertifikalar',
      link: [
        { rel: 'icon', href: '/icons/favicon-48.png', type: 'image/png', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      meta: [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Helal Sertifika' },
      ],
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
