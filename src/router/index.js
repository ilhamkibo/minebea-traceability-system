import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/traceability',
    name: 'Traceability',
    component: () => import('../views/Traceability.vue')
  },
  {
    path: '/process/:id',
    name: 'Process Detail',
    component: () => import('../views/ProcessDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
