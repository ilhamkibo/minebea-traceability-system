import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VueApexCharts from "vue3-apexcharts";
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 menit
            refetchOnWindowFocus: true,
            refetchInterval(query) {
                if (document.visibilityState !== 'visible') {
                    return false
                }
            },
            retry: 1,
        },
    },
})

const app = createApp(App)
app.use(router)
app.use(VueApexCharts)
app.use(VueQueryPlugin, {
    queryClient,
})
app.mount('#app')
