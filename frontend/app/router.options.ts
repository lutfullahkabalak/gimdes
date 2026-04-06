import type { RouterConfig } from 'vue-router'

export default {
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition)
      return savedPosition
    if (to.hash)
      return { el: to.hash, behavior: 'smooth' }
    return { top: 0, left: 0 }
  },
} satisfies RouterConfig
