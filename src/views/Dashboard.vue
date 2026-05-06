<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PcbData } from '@/types/pcb'
import { usePcbsList, useRecentPcbs } from '@/hooks/usePcbQueries'
import { usePcbData } from '../composables/usePcbData'
import { useTheme } from '@/composables/useTheme'
import { ScanLine, CheckCircle, XCircle, TrendingUp, Download } from 'lucide-vue-next'

const { data: recentPcbs } = useRecentPcbs()

// Load daterange from localStorage, default to 0 (Last 7 Days)
const storedDaterange = (() => {
  try {
    const saved = localStorage.getItem('dashboardDaterange')
    return saved !== null ? Number(saved) : 0
  } catch {
    return 0
  }
})()

const daterange = ref(storedDaterange)

watch(daterange, (val) => {
  localStorage.setItem('dashboardDaterange', String(val))
})

const params = computed(() => ({
  page: 1,
  limit: 2,
  daterange: daterange.value,
  paginate: false
}))

const { data: pcbList } = usePcbsList(params)

const { getDailyStats, getProcessDistribution } = usePcbData()
const { isDark } = useTheme()

const pcbListData = computed(() => pcbList.value?.data || [])

const stats = computed(() => {
  const total = pcbListData.value.length
  const ok = pcbListData.value.filter(r => r.itemStatus === 'OK').length
  const ng = pcbListData.value.filter(r => r.itemStatus === 'NG').length
  const yield_rate = total > 0 ? ((ok / total) * 100).toFixed(1) : '0.0'
  
  return [
    { label: 'Total Scanned', value: total, icon: ScanLine, color: 'text-brand-accent' },
    { label: 'Total OK', value: ok, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Disposal (NG)', value: ng, icon: XCircle, color: 'text-rose-500' },
    { label: 'Yield Rate', value: `${yield_rate}%`, icon: TrendingUp, color: 'text-blue-500' },
  ]
})

const dailyData = computed(() => getDailyStats())
const distribution = computed(() => getProcessDistribution())
  
const chartOptions = computed(() => ({
  chart: {
    type: 'area' as const,
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    background: 'transparent'
  },
  theme: {
    mode: isDark.value ? 'dark' : 'light'
  },
  colors: ['#3b82f6', '#10b981'],
  stroke: { curve: 'smooth' as const, width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: dailyData.value.categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: '10px' } }
  },
  grid: { borderColor: isDark.value ? '#334155' : '#f1f5f9' },
  yaxis: { show: false }
}))

const series = computed(() => [
  { name: 'Total Scanned', data: dailyData.value.totalSeries },
  { name: 'OK Status', data: dailyData.value.okSeries }
])

const operators = [
  {
    id: 1,
    station: 'Camera Check',
    operator: 'Budi',
    color: 'bg-blue-500 dark:bg-blue-400',
    iconPath: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
  },
  {
    id: 2,
    station: 'Visual Check',
    operator: 'Siti',
    color: 'bg-green-500 dark:bg-green-400',
    iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
  },
  {
    id: 3,
    station: 'Touch Up',
    operator: 'Andi',
    color: 'bg-orange-500 dark:bg-orange-400',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  },
  {
    id: 4,
    station: 'ROM Writing',
    operator: 'Rina',
    color: 'bg-purple-500 dark:bg-purple-400',
    iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
  },
  {
    id: 5,
    station: 'Final Inspection',
    operator: 'Cici',
    color: 'bg-red-500 dark:bg-red-400',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
]
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
      <div>
        <h3 class="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Production Overview</h3>
        <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400">Traceability summary for Minebea plant.</p>
      </div>
      <div class="flex items-center space-x-2">
        <select v-model.number="daterange" class="flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 text-[10px] lg:text-xs outline-none focus:border-brand-accent transition-colors">
          <option value="0">Last 7 Days</option>
          <option value="1">Last 30 Days</option>
        </select>
        <button class="bg-brand-dark text-white px-3 py-1.5 rounded-lg flex items-center justify-center text-[10px] lg:text-xs hover:bg-slate-800 transition-colors font-bold">
          <Download class="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1.5" />
          <span class="hidden lg:inline">Export Report</span>
        </button>
      </div>
    </div>

    <!-- Operator Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
      <div v-for="op in operators" :key="op.id" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/50 p-5 hover:shadow-md transition-shadow">
        <div class="flex flex-col items-center">
          <div :class="`w-10 h-10 rounded-full ${op.color} flex items-center justify-center mb-3`">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="op.iconPath" />
            </svg>
          </div>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ op.station }}</p>
          <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">Operator: {{ op.operator }}</p>
        </div>
      </div>
    </div>
   
    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center p-3 lg:p-4 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[9px] lg:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ stat.label }}</p>
          <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <component :is="stat.icon" class="w-4 h-4 lg:w-5 lg:h-5" :class="stat.color" />
          </div>
        </div>
        <h4 class="text-lg lg:text-xl font-black text-slate-800 dark:text-slate-100 leading-none">{{ stat.value }}</h4>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2 p-3 lg:p-4">
        <div class="flex justify-between items-center mb-3">
          <h5 class="font-bold text-slate-800 dark:text-slate-100 text-xs lg:text-sm">Production Trend</h5>
          <div class="flex items-center space-x-3 text-[9px] font-bold uppercase tracking-wider">
             <div class="flex items-center text-blue-600"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1"></span> Total</div>
             <div class="flex items-center text-emerald-600"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> OK</div>
          </div>
        </div>
        <div class="h-[180px] lg:h-[220px]">
          <apexchart v-if="series[0].data.length > 0" height="100%" width="100%" :options="chartOptions" :series="series"></apexchart>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col p-3 lg:p-4">
        <h5 class="font-bold text-slate-800 dark:text-slate-100 mb-3 text-xs lg:text-sm">Process Distribution</h5>
        <div class="space-y-3 flex-1 overflow-y-auto pr-1 pb-1">
          <div v-for="proc in distribution" :key="proc.name">
            <div class="flex justify-between text-[10px] lg:text-xs mb-1">
              <span class="text-slate-600 dark:text-slate-400 font-medium">{{ proc.name }}</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ proc.percentage }}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div class="bg-brand-accent h-full transition-all duration-1000 ease-out" :style="{ width: proc.percentage + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="mt-3 p-2 bg-blue-50/50 dark:bg-blue-500/10 rounded-lg border border-dashed border-blue-100 dark:border-blue-500/20 text-center shrink-0">
           <p class="text-[9px] text-blue-700 italic font-medium leading-tight">Auto-sync with active sensors.</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div class="flex justify-between items-center px-4 py-3 border-b border-slate-50 dark:border-slate-700/50">
        <h5 class="font-bold text-slate-800 dark:text-slate-100 text-xs lg:text-sm">Recent Scanned PCB</h5>
        <RouterLink to="/traceability" class="text-brand-accent text-[10px] lg:text-xs font-bold hover:underline">View All</RouterLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] lg:text-[10px]">
              <th class="px-4 py-2 font-black">PCB ID</th>
              <th class="px-4 py-2 font-black">Last Process</th>
              <th class="px-4 py-2 font-black hidden sm:table-cell">Timestamp</th>
              <th class="px-4 py-2 font-black text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <tr v-for="pcb in recentPcbs?.data" :key="pcb.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group" @click="$router.push({ name: 'Traceability', query: { id: pcb.id }})">
              <td class="px-4 py-1.5 lg:py-2 font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-accent transition-colors">{{ pcb.value }}</td>
              <td class="px-4 py-1.5 lg:py-2 text-slate-600 dark:text-slate-300 font-medium text-xs">{{ pcb.lastAppearance }}</td>
              <td class="px-4 py-1.5 lg:py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell text-[10px]">{{ new Date(pcb.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) }}</td>
              <td class="px-4 py-1.5 lg:py-2 text-right">
                <span :class="pcb.itemStatus === 'OK' ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-100 text-rose-700'" class="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter">
                  {{ pcb.itemStatus }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
