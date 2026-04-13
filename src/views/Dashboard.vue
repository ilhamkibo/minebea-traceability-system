<script setup>
import { ref, computed } from 'vue'
import { usePcbData } from '../composables/usePcbData'

const { pcbRecords, getDailyStats, getProcessDistribution } = usePcbData()

const stats = computed(() => {
  const total = pcbRecords.value.length
  const ok = pcbRecords.value.filter(r => r.currentStatus === 'OK').length
  const disposal = pcbRecords.value.filter(r => r.currentStatus === 'Disposal').length
  const yield_rate = total > 0 ? ((ok / total) * 100).toFixed(1) : 0
  
  return [
    { label: 'Total Scanned', value: total, icon: 'qr_code_scanner', color: 'text-brand-accent' },
    { label: 'Total OK', value: ok, icon: 'check_circle', color: 'text-success' },
    { label: 'Disposal (NG)', value: disposal, icon: 'cancel', color: 'text-error' },
    { label: 'Yield Rate', value: `${yield_rate}%`, icon: 'trending_up', color: 'text-info' },
  ]
})

const dailyData = computed(() => getDailyStats())
const distribution = computed(() => getProcessDistribution())

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif'
  },
  colors: ['#3b82f6', '#10b981'],
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: dailyData.value.categories,
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  grid: { borderColor: '#f1f5f9' },
  yaxis: { show: false }
}))

const series = computed(() => [
  { name: 'Total Scanned', data: dailyData.value.totalSeries },
  { name: 'OK Status', data: dailyData.value.okSeries }
])
</script>

<template>
  <div class="space-y-6 lg:space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
      <div>
        <h3 class="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Production Overview</h3>
        <p class="text-xs lg:text-sm text-slate-500">Traceability summary for Minebea plant.</p>
      </div>
      <div class="flex items-center space-x-2">
        <select class="flex-1 sm:flex-none bg-white border border-slate-200 rounded-lg px-3 lg:px-4 py-2 text-xs lg:text-sm outline-none focus:ring-2 ring-brand-accent/20">
          <option>Last 7 Days</option>
          <option>This Month</option>
        </select>
        <button class="btn-primary flex items-center justify-center text-xs lg:text-sm">
          <span class="material-icons text-sm lg:mr-2">download</span>
          <span class="hidden lg:inline">Export Report</span>
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <div v-for="stat in stats" :key="stat.label" class="card flex items-center p-4 lg:p-6 transition-transform hover:scale-[1.02]">
        <div class="p-3 rounded-xl bg-slate-50 mr-4">
          <span class="material-icons text-xl lg:text-2xl" :class="stat.color">{{ stat.icon }}</span>
        </div>
        <div>
          <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">{{ stat.label }}</p>
          <h4 class="text-xl lg:text-2xl font-black text-slate-800">{{ stat.value }}</h4>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <div class="card lg:col-span-2 overflow-hidden">
        <div class="flex justify-between items-center mb-6">
          <h5 class="font-bold text-slate-800 text-sm lg:text-base">Production Trend</h5>
          <div class="flex items-center space-x-3 text-[10px] lg:text-xs font-bold uppercase tracking-wider">
             <div class="flex items-center text-blue-600"><span class="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span> Total</div>
             <div class="flex items-center text-emerald-600"><span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> OK</div>
          </div>
        </div>
        <div class="h-[250px] lg:h-[300px]">
          <apexchart v-if="series[0].data.length > 0" height="100%" width="100%" :options="chartOptions" :series="series"></apexchart>
        </div>
      </div>

      <div class="card flex flex-col">
        <h5 class="font-bold text-slate-800 mb-6 text-sm lg:text-base">Process Distribution</h5>
        <div class="space-y-6 flex-1">
          <div v-for="proc in distribution" :key="proc.name">
            <div class="flex justify-between text-xs lg:text-sm mb-2">
              <span class="text-slate-600 font-medium">{{ proc.name }}</span>
              <span class="font-bold text-slate-800">{{ proc.percentage }}%</span>
            </div>
            <div class="w-full bg-slate-100 h-1.5 lg:h-2 rounded-full overflow-hidden">
              <div class="bg-brand-accent h-full transition-all duration-1000 ease-out" :style="{ width: proc.percentage + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="mt-8 p-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-100 text-center">
           <p class="text-[10px] lg:text-xs text-blue-700 italic font-medium">Auto-sync with factory floor sensors active.</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card p-0 overflow-hidden">
      <div class="flex justify-between items-center p-4 lg:p-6 border-b border-slate-50">
        <h5 class="font-bold text-slate-800 text-sm lg:text-base">Recent Scanned PCB</h5>
        <RouterLink to="/traceability" class="text-brand-accent text-xs lg:text-sm font-bold hover:underline">View All</RouterLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs lg:text-sm whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] lg:text-xs">
              <th class="px-4 lg:px-6 py-4 font-black">PCB ID</th>
              <th class="px-4 lg:px-6 py-4 font-black">Last Process</th>
              <th class="px-4 lg:px-6 py-4 font-black hidden sm:table-cell">Timestamp</th>
              <th class="px-4 lg:px-6 py-4 font-black">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="pcb in pcbRecords.slice(0, 8)" :key="pcb.id" class="hover:bg-slate-50/50 transition-colors cursor-pointer group" @click="$router.push({ name: 'Traceability', query: { qr: pcb.id }})">
              <td class="px-4 lg:px-6 py-4 font-bold text-slate-700 group-hover:text-brand-accent transition-colors">{{ pcb.id }}</td>
              <td class="px-4 lg:px-6 py-4 text-slate-600 font-medium">{{ pcb.currentStep }}</td>
              <td class="px-4 lg:px-6 py-4 text-slate-500 hidden sm:table-cell">{{ new Date(pcb.lastUpdate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) }}</td>
              <td class="px-4 lg:px-6 py-4">
                <span :class="pcb.currentStatus === 'OK' ? 'badge badge-success' : 'badge badge-error'" class="px-2 lg:px-3">
                  {{ pcb.currentStatus }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
