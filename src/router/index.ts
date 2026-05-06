import { formatTitle } from '../utils/format'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: 'Dashboard'
    }
  },
  {
    path: '/traceability',
    name: 'Traceability',
    component: () => import('../views/Traceability.vue'),
    meta: {
      title: 'Traceability Timeline'
    }
  },
  {
    path: '/traceability-table',
    name: 'Traceability Table',
    component: () => import('../views/TraceabilityTable.vue'),
    meta: {
      title: 'Traceability Table'
    }
  },
  {
    path: '/process/camera-check',
    name: 'Camera Check',
    component: () => import('../views/CameraCheck.vue'),
    meta: {
      title: 'Camera Check'
    }
  },
  {
    path: '/process/visual-check',
    name: 'Visual Check',
    component: () => import('../views/VisualCheck.vue'),
    meta: {
      title: 'Visual Check'
    }
  },
  {
    path: '/process/touch-up',
    name: 'Touch Up',
    component: () => import('../views/TouchUp.vue'),
    meta: {
      title: 'Touch Up'
    }
  },
  {
    path: '/process/rom-writing',
    name: 'ROM Writing',
    component: () => import('../views/RomWriting.vue'),
    meta: {
      title: 'ROM Writing'
    }
  },
  {
    path: '/process/final-inspection',
    name: 'Final Inspection',
    component: () => import('../views/FinalInspection.vue'),
    meta: {
      title: 'Final Inspection'
    }
  },
  {
    path: '/process/:id',
    name: 'Process Detail',
    component: () => import('../views/ProcessDetail.vue'),
    meta: {
      title: 'Process Detail'
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
    component: () => import('../views/NotFound.vue'),
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
