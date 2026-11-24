/**
 * Marka detayından, logo uçuşu oynamadan geri dönülünce (iOS kaydırma) az önce bakılan
 * kart hafifçe yerine oturur. Uçuş oynadıysa çalışmaz; hareket iki kez görünmesin.
 */
export function useBrandSettle() {
  const activeBrand = useState<number | null>('gimdes-active-brand', () => null)

  onMounted(() => {
    const nav = useNuxtApp().$lastNavigation
    if (!nav?.back || !nav.fromBrand || activeBrand.value === null)
      return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return
    const id = activeBrand.value
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (nav.viewTransition)
        return
      document.querySelector(`[data-brand="${id}"]`)?.animate(
        [
          { transform: 'scale(1)', easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
          { transform: 'scale(0.94)', offset: 0.32, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          { transform: 'scale(1.02)', offset: 0.68, easing: 'cubic-bezier(0.4, 0, 0.3, 1)' },
          { transform: 'scale(1)' },
        ],
        { duration: 620, id: 'brand-settle' },
      )
    }))
  })
}
