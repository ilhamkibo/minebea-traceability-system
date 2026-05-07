<script setup lang="ts">
import { computed } from 'vue'
import { usePcbData } from '@/composables/usePcbData'
import { useTheme } from '@/composables/useTheme'

const { getDailyStats, getProcessDistribution } = usePcbData()
const { isDark } = useTheme()

const dailyData = computed(() => getDailyStats())
const distribution = computed(() => getProcessDistribution())

const chartOptions = computed(() => ({
  chart: {
    type: 'area' as const,
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    background: 'transparent'
  },
  theme: { mode: isDark.value ? 'dark' : 'light' },
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
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
    <!-- Production Trend -->
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

    <!-- Process Distribution -->
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
</template>
