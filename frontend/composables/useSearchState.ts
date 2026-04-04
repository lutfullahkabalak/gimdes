import type { Certificate } from '~/types/gimdes'

export function useSearchState() {
  const query = useState('s-q', () => '')
  const results = useState<Certificate[]>('s-res', () => [])
  const lastExecutedQuery = useState('s-lq', () => '')
  const error = useState('s-err', () => '')
  const loading = useState('s-ld', () => false)
  const accordionOpen = useState<Record<number, boolean>>('s-acc', () => ({}))
  const savedScrollY = useState('s-sy', () => 0)

  function saveScroll() {
    if (import.meta.client) {
      savedScrollY.value = window.scrollY
    }
  }

  async function restoreScroll() {
    if (!import.meta.client || savedScrollY.value <= 0) return
    const y = savedScrollY.value
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
  }

  function reset() {
    query.value = ''
    results.value = []
    lastExecutedQuery.value = ''
    error.value = ''
    loading.value = false
    accordionOpen.value = {}
    savedScrollY.value = 0
  }

  return {
    query,
    results,
    lastExecutedQuery,
    error,
    loading,
    accordionOpen,
    savedScrollY,
    saveScroll,
    restoreScroll,
    reset,
  }
}
