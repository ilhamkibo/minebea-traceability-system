<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { usePcbsList } from '@/hooks/usePcbQueries'
import { useDebounce } from '@/composables/useDebounce'
import { getTodayDate, getYesterdayDate, getLast7DaysDate, getThisMonthStartDate } from '@/utils/date'
import TraceabilityTableFilters from '@/components/TraceabilityTablePage/TraceabilityTableFilters.vue'
import TraceabilityTableHeader from '@/components/TraceabilityTablePage/TraceabilityTableHeader.vue'
import TraceabilityTableRow from '@/components/TraceabilityTablePage/TraceabilityTableRow.vue'
import TraceabilityTableEmptyState from '@/components/TraceabilityTablePage/TraceabilityTableEmptyState.vue'

const searchRef = ref('')
const debouncedSearch = useDebounce(searchRef, 500)
const isSingleDay = ref(true)

const params = ref({
  page: 1,
  limit: 10,
  datetime: getTodayDate(),
  datetimeto: '',
  search: debouncedSearch.value
})

watch(isSingleDay, (val) => {
  if (val) {
    params.value.datetimeto = ''
  } else {
    if (!params.value.datetimeto) params.value.datetimeto = getTodayDate()
  }
  params.value.page = 1
})

watch(debouncedSearch, (newVal) => {
  params.value.search = newVal
  params.value.page = 1
})

const queryParams = computed(() => {
  const p: any = {
    page: params.value.page,
    limit: params.value.limit,
  }
  if (params.value.search) {
    p.search = params.value.search
  } else {
    p.datetime = params.value.datetime || getTodayDate()
    if (!isSingleDay.value && params.value.datetimeto) {
      p.datetimeto = params.value.datetimeto
    }
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

const getMaxRows = (pcb: any) => {
  return Math.max(
    1,
    pcb.cameraChecks?.length || 0,
    pcb.visualChecks?.length || 0,
    pcb.touchUps?.length || 0,
    // TODO(romscan): ROM Writing not yet implemented — uncomment when RomScan is ready
    // pcb.romScans?.length || 0,
    pcb.finalInspecs?.length || 0
  )
}

const handleQuickFilter = (val: string) => {
  switch (val) {
    case 'today':
      isSingleDay.value = true
      params.value.datetime = getTodayDate()
      break
    case 'yesterday':
      isSingleDay.value = true
      params.value.datetime = getYesterdayDate()
      break
    case 'last7days':
      isSingleDay.value = false
      params.value.datetime = getLast7DaysDate()
      params.value.datetimeto = getTodayDate()
      break
    case 'thismonth':
      isSingleDay.value = false
      params.value.datetime = getThisMonthStartDate()
      params.value.datetimeto = getTodayDate()
      break
  }
  params.value.page = 1
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
        
        // TODO(romscan): ROM Scan export columns — uncomment when RomScan service is ready
        // ROM
        // `"${formatDate(pcb.romScans?.[i]?.createdAt)}"`,
        // `"${pcb.romScans?.[i]?.operatorName || ''}"`,
        // `"${pcb.romScans?.[i] ? 'Done' : ''}"`,
        
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
    <TraceabilityTableFilters 
      v-model:params="params"
      v-model:isSingleDay="isSingleDay"
      v-model:searchRef="searchRef"
      :records-count="records.length"
      @export="handleExport"
      @quick-filter="handleQuickFilter"
    />

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative transition-colors">
      <div class="overflow-x-auto min-h-[300px] border border-slate-200 dark:border-slate-700 rounded-lg">
        <table class="w-full text-left text-xs whitespace-nowrap border-collapse">
          <TraceabilityTableHeader />
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
            <TraceabilityTableEmptyState 
              :is-loading="isLoading"
              :is-error="isError"
              :error="error"
              :records-count="records.length"
              :search-ref="searchRef"
              @refetch="refetch"
              @clear-search="searchRef = ''; params.page = 1"
            />

            <!-- Data rows -->
            <template v-if="!isLoading && !isError && records.length > 0">
              <TraceabilityTableRow 
                v-for="pcb in records" 
                :key="pcb.id" 
                :pcb="pcb" 
              />
            </template>
          </tbody>
        </table>
      </div>
      
    </div>
  </div>
</template>
