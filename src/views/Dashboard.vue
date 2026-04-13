<script setup>
import { ref, computed, onMounted } from 'vue'
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
  <div class="space-y-8">
    <div class="flex justify-between items-end">
      <div>
        <h3 class="text-2xl font-bold text-slate-800">Production Overview</h3>
        <p class="text-slate-500">Real-time traceability summary for Minebea plant.</p>
      </div>
      <div class="flex space-x-2">
        <select class="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 ring-brand-accent/20">
          <option>Last 7 Days</option>
          <option>This Month</option>
        </select>
        <button class="btn-primary flex items-center">
          <span class="material-icons text-sm mr-2">download</span>
          Export Report
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="card flex items-center p-6">
        <div class="p-3 rounded-xl bg-slate-50 mr-4">
          <span class="material-icons" :class="stat.color">{{ stat.icon }}</span>
        </div>
        <div>
          <p class="text-sm text-slate-500 font-medium">{{ stat.label }}</p>
          <h4 class="text-2xl font-bold text-slate-800">{{ stat.value }}</h4>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card lg:col-span-2">
        <div class="flex justify-between items-center mb-6">
          <h5 class="font-bold text-slate-800">Production Trend</h5>
          <div class="flex items-center space-x-4 text-xs font-medium">
             <div class="flex items-center"><span class="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Total</div>
             <div class="flex items-center"><span class="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> OK</div>
          </div>
        </div>
        <apexchart v-if="series[0].data.length > 0" height="300" :options="chartOptions" :series="series"></apexchart>
      </div>

      <div class="card">
        <h5 class="font-bold text-slate-800 mb-6">Process Distribution</h5>
        <div class="space-y-6">
          <div v-for="proc in distribution" :key="proc.name">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-slate-600">{{ proc.name }}</span>
              <span class="font-bold text-slate-800">{{ proc.percentage }}%</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-brand-accent h-full transition-all duration-1000" :style="{ width: proc.percentage + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="mt-8 p-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-200 text-center">
           <p class="text-xs text-blue-700 italic">"Production data is automatically synced with factory floor scanners."</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h5 class="font-bold text-slate-800">Recent Scanned PCB</h5>
        <RouterLink to="/traceability" class="text-brand-accent text-sm font-medium hover:underline">View All</RouterLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="text-slate-400 border-b border-slate-100">
              <th class="pb-4 font-medium">PCB ID / QR</th>
              <th class="pb-4 font-medium">Last Process</th>
              <th class="pb-4 font-medium">Timestamp</th>
              <th class="pb-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="pcb in pcbRecords.slice(0, 10)" :key="pcb.id" class="hover:bg-slate-50/50 transition-colors cursor-pointer" @click="$router.push({ name: 'Traceability', query: { qr: pcb.id }})">
              <td class="py-4 font-bold text-slate-700">{{ pcb.id }}</td>
              <td class="py-4 text-slate-600">{{ pcb.currentStep }}</td>
              <td class="py-4 text-slate-500">{{ new Date(pcb.lastUpdate).toLocaleString() }}</td>
              <td class="py-4">
                <span :class="pcb.currentStatus === 'OK' ? 'badge badge-success' : 'badge badge-error'">
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
