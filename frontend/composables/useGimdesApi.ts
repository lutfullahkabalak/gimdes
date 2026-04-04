import type { Category, Certificate } from '~/types/gimdes'

export function useGimdesApi() {
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string)?.replace(/\/$/, '') ?? ''

  function pathUrl(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`
    if (apiBase) return `${apiBase}${p}`
    return p
  }

  async function getCategories(filter = ''): Promise<Category[]> {
    return await $fetch<Category[]>(pathUrl('/v1/categories'), {
      query: filter.trim() ? { filter: filter.trim() } : undefined,
    })
  }

  async function getCertificatesByCategoryHref(href: string): Promise<Certificate[]> {
    return await $fetch<Certificate[]>(pathUrl('/v1/certificates'), {
      query: { page_path: href },
    })
  }

  async function getCertificateList(listPath = ''): Promise<Certificate[]> {
    return await $fetch<Certificate[]>(pathUrl('/v1/certificates'), {
      query: listPath ? { list_path: listPath } : undefined,
    })
  }

  async function searchCertificates(q: string): Promise<Certificate[]> {
    return await $fetch<Certificate[]>(pathUrl('/v1/search'), {
      query: { q: q.trim() },
    })
  }

  return {
    getCategories,
    getCertificatesByCategoryHref,
    getCertificateList,
    searchCertificates,
  }
}
