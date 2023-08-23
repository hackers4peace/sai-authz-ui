// Composables
import { h } from 'vue'
import { useCoreStore } from '@/store/core'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Home.vue'),
        children: [
          // {
          //   path: '/authorization',
          //   name: 'authorization',
          //   component: () => import(/* webpackChunkName: "authorization" */ '@/views/Authorization.vue'),
          // }
        ]
      },
      {
        path: '/login',
        name: 'login',
        component: () => import(/* webpackChunkName: "authn" */ '@/views/Authn.vue'),
        meta: { public: true }
      },
      {
        path: '/redirect',
        name: 'redirect',
        beforeEnter: handleRedirect,
        component: h('div'), // empty component
        meta: { public: true }
      },
    ],
  },
]


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from) => {
  const coreStore = useCoreStore()
  await coreStore.restoreOidcSession()

  if (!to.meta.public) {
    if (!coreStore.userId || !coreStore.isBackendLoggedIn) {
      return {
        name: 'login',
        // query: { redirect: to.fullPath },
      }
    }
  }
})

async function handleRedirect() {
  const coreStore = useCoreStore()
  await coreStore.handleRedirect(window.location.href)

  return { name: 'dashboard' }
}

export default router
