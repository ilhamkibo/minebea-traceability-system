<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePcbsList } from '@/hooks/usePcbQueries'
import { useDebounce } from '@/composables/useDebounce'
import { getTodayDate, getYesterdayDate, getLast7DaysDate, getThisMonthStartDate } from '@/utils/date'
import { TriangleAlert, SearchX, Download } from 'lucide-vue-next'
import Pagination from '@/components/Pagination.vue'

const searchRef = ref('')
const debouncedSearch = useDebounce(searchRef, 500)
const isSingleDay = ref(true)

const params = reactive({
  page: 1,
  limit: 10,
  datetime: getTodayDate(),
  datetimeto: '',
  search: debouncedSearch.value
})

watch(isSingleDay, (val) => {
  if (val) {
    params.datetimeto = ''
  } else {
    if (!params.datetimeto) params.datetimeto = getTodayDate()
  }
  params.page = 1
})

watch(debouncedSearch, (newVal) => {
  params.search = newVal
  params.page = 1
})

const queryParams = computed(() => {
  const p: any = {
    page: params.page,
    limit: params.limit,
  }
  if (params.search) {
    p.search = params.search
  } else {
    p.datetime = params.datetime || getTodayDate()
    if (params.datetimeto) p.datetimeto = params.datetimeto
  }
  return p
})

const { data: pcbResponse, isLoading, isError, error, refetch } = usePcbsList(queryParams)

const records = computed(() => {
  if (pcbResponse.value?.data && Array.isArray(pcbResponse.value.data)) {
    return pcbResponse.value.data
  }
  if (Array.isArray(pcbResponse.value)) {
    return pcbResponse.value
  }
  return []
})

const paginationMeta = computed(() => {
  return pcbResponse.value?.pagination || null
})

const getMaxRows = (pcb: any) => {
  return Math.max(
    1,
    pcb.cameraChecks?.length || 0,
    pcb.visualChecks?.length || 0,
    pcb.touchUps?.length || 0,
    pcb.romScans?.length || 0,
    pcb.finalInspecs?.length || 0
  )
}

const handleDateChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  params.datetime = target.value
  params.page = 1
  // Reset select if custom date picked
  const quickFilter = document.getElementById('quick-filter') as HTMLSelectElement
  if (quickFilter) quickFilter.value = 'custom'
}

const handleDateToChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  params.datetimeto = target.value
  params.page = 1
  // Reset select if custom date picked
  const quickFilter = document.getElementById('quick-filter') as HTMLSelectElement
  if (quickFilter) quickFilter.value = 'custom'
}

const handleQuickFilter = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value
  switch (val) {
    case 'today':
      isSingleDay.value = true
      params.datetime = getTodayDate()
      break
    case 'yesterday':
      isSingleDay.value = true
      params.datetime = getYesterdayDate()
      break
    case 'last7days':
      isSingleDay.value = false
      params.datetime = getLast7DaysDate()
      params.datetimeto = getTodayDate()
      break
    case 'thismonth':
      isSingleDay.value = false
      params.datetime = getThisMonthStartDate()
      params.datetimeto = getTodayDate()
      break
  }
  params.page = 1
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

const handleExport = () => {
  if (records.value.length === 0) return

  const headers = [
    'QR Code',
    'Camera Check Date', 'Camera Check Operator', 'Camera Check Result',
    'Visual Check Date', 'Visual Check Operator', 'Visual Check Result',
    'Touch Up Date', 'Touch Up Operator', 'Touch Up Result',
    'ROM Scan Date', 'ROM Scan Operator', 'ROM Scan Result',
    'Final Inspect Date', 'Final Inspect Operator', 'Final Inspect Result'
  ]

  const csvRows = [headers.join(',')]

  records.value.forEach(pcb => {
    const maxRows = getMaxRows(pcb)
    for (let i = 0; i < maxRows; i++) {
      const row = [
        `"${i === 0 ? pcb.value : ''}"`,
        
        // Camera
        `"${formatDate(pcb.cameraChecks?.[i]?.createdAt)}"`,
        `"${pcb.cameraChecks?.[i]?.operatorName || ''}"`,
        `"${pcb.cameraChecks?.[i]?.judgement || ''}"`,
        
        // Visual
        `"${formatDate(pcb.visualChecks?.[i]?.createdAt)}"`,
        `"${pcb.visualChecks?.[i]?.operatorName || ''}"`,
        `"${pcb.visualChecks?.[i]?.judgement || ''}"`,
        
        // Touch Up
        `"${formatDate(pcb.touchUps?.[i]?.createdAt)}"`,
        `"${pcb.touchUps?.[i]?.operatorName || ''}"`,
        `"${pcb.touchUps?.[i] ? 'Done' : ''}"`,
        
        // ROM
        `"${formatDate(pcb.romScans?.[i]?.createdAt)}"`,
        `"${pcb.romScans?.[i]?.operatorName || ''}"`,
        `"${pcb.romScans?.[i] ? 'Done' : ''}"`,
        
        // Final
        `"${formatDate(pcb.finalInspecs?.[i]?.createdAt)}"`,
        `"${pcb.finalInspecs?.[i]?.operatorName || ''}"`,
        `"${pcb.finalInspecs?.[i] ? 'Done' : ''}"`
      ]
      csvRows.push(row.join(','))
    }
  })

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `traceability_export_${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div>
        <h3 class="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100">Traceability Table</h3>
        <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400">Full process overview for each QR Code across all stations.</p>
      </div>
      
      <div class="flex flex-wrap items-center gap-2">
        <button 
          @click="handleExport"
          :disabled="records.length === 0"
          class="text-xs px-3 py-1.5 bg-brand-dark hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-1.5 transition-colors font-bold shadow-sm"
        >
          <Download class="w-3.5 h-3.5" />
          Export
        </button>

        <input 
          v-model="searchRef"
          type="text" 
          placeholder="Search QR Code..." 
          class="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
        />
        
        <select 
          id="quick-filter"
          @change="handleQuickFilter"
          class="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors cursor-pointer"
        >
          <option value="custom" disabled hidden selected>Quick Filter</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 Days</option>
          <option value="thismonth">This Month</option>
        </select>

        <div class="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5">
          <input 
            :value="params.datetime"
            @change="handleDateChange"
            type="date" 
            :max="getTodayDate()"
            class="text-xs px-2 py-1 bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
          />
          <span class="text-slate-300 dark:text-slate-600 font-medium text-xs">to</span>
          <input 
            :value="params.datetimeto"
            @change="handleDateToChange"
            type="date" 
            :max="getTodayDate()"
            :disabled="isSingleDay"
            :class="isSingleDay ? 'opacity-50 cursor-not-allowed' : ''"
            class="text-xs px-2 py-1 bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
          />
          <label class="flex items-center gap-1.5 ml-2 border-l border-slate-200 dark:border-slate-700 pl-2 cursor-pointer group">
            <div class="relative flex items-center justify-center w-3 h-3 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-brand-accent transition-colors overflow-hidden">
              <input type="checkbox" v-model="isSingleDay" class="absolute opacity-0 w-full h-full cursor-pointer z-10" />
              <svg v-if="isSingleDay" class="w-2.5 h-2.5 text-brand-accent absolute pointer-events-none" viewBox="0 0 14 14" fill="none">
                <path d="M3 8L6 11L11 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium select-none group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">1 Day</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative transition-colors">
      <div class="overflow-x-auto min-h-[300px] border border-slate-200 dark:border-slate-700 rounded-lg">
        <table class="w-full text-left text-xs whitespace-nowrap border-collapse">
          <thead>
            <tr class="bg-slate-100/50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-widest text-[10px] lg:text-[11px]">
              <th rowspan="2" class="px-4 py-3 font-bold border border-slate-200 dark:border-slate-700 align-middle text-center min-w-[100px]">QR Code</th>
              <th colspan="3" class="px-4 py-2 font-bold border border-slate-200 dark:border-slate-700 text-center">Camera Check</th>
              <th colspan="3" class="px-4 py-2 font-bold border border-slate-200 dark:border-slate-700 text-center">Visual Check</th>
              <th colspan="3" class="px-4 py-2 font-bold border border-slate-200 dark:border-slate-700 text-center">Touch Up</th>
              <th colspan="3" class="px-4 py-2 font-bold border border-slate-200 dark:border-slate-700 text-center">ROM Scan</th>
              <th colspan="3" class="px-4 py-2 font-bold border border-slate-200 dark:border-slate-700 text-center">Final Inspect</th>
              <th rowspan="2" class="px-4 py-3 font-bold border border-slate-200 dark:border-slate-700 align-middle text-center min-w-[80px]">Actions</th>
            </tr>
            <tr class="bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[9px] lg:text-[10px]">
              <!-- Camera Check -->
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Date&Time</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Operator Name</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Result</th>
              <!-- Visual Check -->
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Date&Time</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Operator Name</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Result</th>
              <!-- Touch Up -->
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Date&Time</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Operator Name</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Result</th>
              <!-- ROM Scan -->
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Date&Time</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Operator Name</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Result</th>
              <!-- Final Inspect -->
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Date&Time</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Operator Name</th>
              <th class="px-2 py-1.5 font-semibold border border-slate-200 dark:border-slate-700 text-center">Result</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
            <!-- Loading skeleton -->
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="'skeleton-'+i" class="animate-pulse">
                <td class="px-4 py-3 border border-slate-200 dark:border-slate-700"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                <td class="px-3 py-3 border border-slate-200 dark:border-slate-700" v-for="j in 15" :key="'sk-'+j">
                  <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-14 mx-auto"></div>
                </td>
                <td class="px-4 py-3 text-center border border-slate-200 dark:border-slate-700"><div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-14 mx-auto"></div></td>
              </tr>
            </template>

            <!-- Data rows -->
            <template v-else-if="records.length > 0">
              <template v-for="pcb in records" :key="pcb.id">
                <tr v-for="rowIndex in getMaxRows(pcb)" :key="`${pcb.id}-${rowIndex}`" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <!-- QR Code -->
                  <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" class="px-4 py-3 font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 align-top whitespace-nowrap text-[13px] bg-white dark:bg-slate-800">{{ pcb.value }}</td>

                  <!-- Camera Check -->
                  <template v-if="pcb.cameraChecks && pcb.cameraChecks[rowIndex - 1]">
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.cameraChecks[rowIndex - 1].createdAt) }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.cameraChecks[rowIndex - 1].operatorName }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold" :class="pcb.cameraChecks[rowIndex - 1].judgement === 'OK' ? 'text-emerald-600' : 'text-rose-600'">{{ pcb.cameraChecks[rowIndex - 1].judgement }}</td>
                  </template>
                  <template v-else-if="!pcb.cameraChecks || pcb.cameraChecks.length === 0">
                    <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
                  </template>
                  <template v-else>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                  </template>

                  <!-- Visual Check -->
                  <template v-if="pcb.visualChecks && pcb.visualChecks[rowIndex - 1]">
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.visualChecks[rowIndex - 1].createdAt) }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.visualChecks[rowIndex - 1].operatorName }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold" :class="pcb.visualChecks[rowIndex - 1].judgement === 'OK' ? 'text-emerald-600' : 'text-rose-600'">{{ pcb.visualChecks[rowIndex - 1].judgement }}</td>
                  </template>
                  <template v-else-if="!pcb.visualChecks || pcb.visualChecks.length === 0">
                    <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
                  </template>
                  <template v-else>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                  </template>

                  <!-- Touch Up -->
                  <template v-if="pcb.touchUps && pcb.touchUps[rowIndex - 1]">
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.touchUps[rowIndex - 1].createdAt) }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.touchUps[rowIndex - 1].operatorName }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold text-blue-600 dark:text-blue-400">Done</td>
                  </template>
                  <template v-else-if="!pcb.touchUps || pcb.touchUps.length === 0">
                    <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
                  </template>
                  <template v-else>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                  </template>

                  <!-- ROM Scan -->
                  <template v-if="pcb.romScans && pcb.romScans[rowIndex - 1]">
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.romScans[rowIndex - 1].createdAt) }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.romScans[rowIndex - 1].operatorName }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold text-blue-600 dark:text-blue-400">Done</td>
                  </template>
                  <template v-else-if="!pcb.romScans || pcb.romScans.length === 0">
                    <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
                  </template>
                  <template v-else>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                  </template>

                  <!-- Final Inspect -->
                  <template v-if="pcb.finalInspecs && pcb.finalInspecs[rowIndex - 1]">
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.finalInspecs[rowIndex - 1].createdAt) }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.finalInspecs[rowIndex - 1].operatorName }}</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold text-blue-600 dark:text-blue-400">Done</td>
                  </template>
                  <template v-else-if="!pcb.finalInspecs || pcb.finalInspecs.length === 0">
                    <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
                  </template>
                  <template v-else>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                    <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
                  </template>

                  <!-- Actions -->
                  <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" class="px-4 py-2.5 text-center align-middle border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <RouterLink :to="{ name: 'Traceability', query: { id: pcb.id }}" class="inline-block bg-brand-dark/5 dark:bg-white/10 hover:bg-brand-dark dark:hover:bg-white/20 text-brand-dark dark:text-white hover:text-white px-3 py-2 rounded-lg text-[11px] font-bold transition-all">
                      Details
                    </RouterLink>
                  </td>
                </tr>
              </template>
            </template>

            <!-- Error Alert -->
            <template v-else-if="isError">
              <tr>
                <td colspan="17" class="px-4 py-16 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="bg-red-50 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-800/50">
                      <TriangleAlert class="h-8 w-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">Failed to load data</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      {{ (error as any)?.response?.data?.message || (error as any)?.message || 'An unexpected error occurred.' }}
                    </p>
                    <button @click="refetch()" class="mt-5 px-5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <template v-else-if="!isLoading && !isError">
              <tr>
                <td colspan="17" class="px-4 py-16 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700/50">
                      <SearchX class="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">No records found</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      We couldn't find any data for the selected period or search criteria.
                    </p>
                    <button 
                      v-if="searchRef"
                      @click="searchRef = ''; params.page = 1" 
                      class="mt-5 px-4 py-2 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Search
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <Pagination 
        v-if="!isLoading && records.length > 0"
        :meta="paginationMeta"
        v-model:page="params.page"
        v-model:limit="params.limit"
        :total-records="records.length"
      />
    </div>
  </div>
</template>