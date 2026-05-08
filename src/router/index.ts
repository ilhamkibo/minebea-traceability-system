import { formatTitle } from '../utils/format'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardPage.vue'),
    meta: {
      title: 'Dashboard'
    }
  },
  {
    path: '/traceability',
    name: 'Traceability',
    component: () => import('../views/TraceabilityPage.vue'),
    meta: {
      title: 'Traceability Timeline'
    }
  },
  {
    path: '/traceability-table',
    name: 'Traceability Table',
    component: () => import('../views/TraceabilityTablePage.vue'),
    meta: {
      title: 'Traceability Table'
    }
  },
  {
    path: '/process/camera-check',
    name: 'Camera Check',
    component: () => import('../views/CameraCheckPage.vue'),
    meta: {
      title: 'Camera Check'
    }
  },
  {
    path: '/process/visual-check',
    name: 'Visual Check',
    component: () => import('../views/VisualCheckPage.vue'),
    meta: {
      title: 'Visual Check'
    }
  },
  {
    path: '/process/touch-up',
    name: 'Touch Up',
    component: () => import('../views/TouchUpPage.vue'),
    meta: {
      title: 'Touch Up'
    }
  },
  {
    path: '/process/rom-writing',
    name: 'ROM Writing',
    component: () => import('../views/RomWritingPage.vue'),
    meta: {
      title: 'ROM Writing'
    }
  },
  {
    path: '/process/final-inspection',
    name: 'Final Inspection',
    component: () => import('../views/FinalInspectionPage.vue'),
    meta: {
      title: 'Final Inspection'
    }
  },
  {
    path: '/operators',
    name: 'Operators',
    component: () => import('../views/OperatorPage.vue'),
    meta: {
      title: 'Operators'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue'),
    meta: {
      title: 'Page Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


router.afterEach((to) => {
  const baseTitle = 'PCB Traceability - Shinsei Densi'

  let title = to.meta.title as string

  if (to.params.id) {
    const formatted = formatTitle(to.params.id as string)
    title = `${title} - ${formatted}`
  }

  document.title = title
    ? `${title} | ${baseTitle}`
    : baseTitle
})


export default router
