/**
 * Son sayfa değişiminin türünü tutar: geri mi dönüldü, View Transition oynadı mı.
 * iOS kenardan kaydırmada geçişi sistem çizer ve Nuxt kendi geçişini atlar.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const last = { back: false, fromBrand: false, viewTransition: false }
  let pendingBack = false

  // Vue Router'ın kendi dinleyicisiyle aynı anda, yönlendirme korumalarından önce çalışır.
  router.options.history.listen((_to, _from, info) => {
    pendingBack = info.type === 'pop' && info.direction === 'back'
  })
  router.beforeEach((to, from) => {
    if (to.path === from.path)
      return
    last.back = pendingBack
    last.fromBrand = from.path.startsWith('/marka/')
    last.viewTransition = false
    pendingBack = false
  })
  nuxtApp.hook('page:view-transition:start', (transition) => {
    last.viewTransition = true
    // Sistem geçişi kendisi çizdiyse Nuxt başlattığı geçişi hemen iptal eder; oynamamış say.
    transition.ready.catch(() => { last.viewTransition = false })
  })

  return { provide: { lastNavigation: last } }
})
