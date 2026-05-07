<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePcbsList, useRecentPcbs } from '@/hooks/usePcbQueries'
import { ScanLine, CheckCircle, XCircle, TrendingUp } from 'lucide-vue-next'

import DashboardHeader from '@/components/DashboardPage/DashboardHeader.vue'
import DashboardOperatorCards from '@/components/DashboardPage/DashboardOperatorCards.vue'
import DashboardStats from '@/components/DashboardPage/DashboardStats.vue'
import DashboardCharts from '@/components/DashboardPage/DashboardCharts.vue'
import DashboardRecentActivity from '@/components/DashboardPage/DashboardRecentActivity.vue'

const { data: recentPcbs } = useRecentPcbs()

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
</script>

<template>
  <div class="space-y-4">
    <DashboardHeader v-model:daterange="daterange" />
    <DashboardOperatorCards />
    <DashboardStats :stats="stats" />
    <DashboardCharts />
    <DashboardRecentActivity :recentPcbs="recentPcbs?.data" />
  </div>
</template>
