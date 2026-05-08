<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useFinalInspections } from '@/hooks/useFinalInspection'
import { useDebounce } from '@/composables/useDebounce'
import { getTodayDate } from '@/utils/date'
import { TriangleAlert, SearchX } from 'lucide-vue-next'
import Pagination from '@/components/Pagination.vue'

const searchRef = ref('')
const debouncedSearch = useDebounce(searchRef, 500)
const limitRef = ref(10)

const params = reactive({
  page: 1,
  limit: limitRef.value,
  datetime: '',
  search: debouncedSearch.value
})

watch(debouncedSearch, (newVal) => {
  params.search = newVal
  params.page = 1
})

watch(limitRef, (newVal) => {
  params.limit = newVal
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
  }
  return p
})

const { data: finalInspections, isLoading, isError, error, refetch } = useFinalInspections(queryParams)

const handleDateChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  params.datetime = target.value
  params.page = 1
}

const records = computed(() => {
  if (finalInspections.value?.data && Array.isArray(finalInspections.value.data)) {
    return finalInspections.value.data
  }
  if (Array.isArray(finalInspections.value)) {
    return finalInspections.value
  }
  return []
})

const paginationMeta = computed(() => {
  return finalInspections.value?.pagination || null
})

</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div>
        <h3 class="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100">Final Inspection Monitoring</h3>
        <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400">List of PCBs processed through Final Inspection station.</p>
      </div>
      
      <div class="flex flex-wrap items-center gap-2">
        <input 
          v-model="searchRef"
          type="text" 
          placeholder="Search QR Code..." 
          class="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
        />
        
        <input 
          :value="params.datetime"
          @change="handleDateChange"
          type="date" 
          class="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative transition-colors">
      <div class="overflow-x-auto min-h-[300px]">
        <table class="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px] lg:text-[10px]">
              <th class="px-4 py-2.5 font-black">PCB ID / QR Code</th>
              <th class="px-4 py-2.5 font-black">Process Time</th>
              <th class="px-4 py-2.5 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="'skeleton-'+i" class="animate-pulse">
                <td class="px-4 py-3"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                <td class="px-4 py-3"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                <td class="px-4 py-3 text-right"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div></td>
              </tr>
            </template>
            <template v-else-if="records.length > 0">
              <tr v-for="pcb in records" :key="pcb.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                <td class="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-200">{{ pcb.qrCode }}</td>
                <td class="px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium text-[10px] lg:text-xs">{{ pcb.createdAt ? new Date(pcb.createdAt).toLocaleString() : '-' }}</td>
                <td class="px-4 py-2.5 text-right">
                  <RouterLink :to="{ name: 'Traceability', query: { qr: pcb.qrCode }}" class="bg-brand-dark/5 dark:bg-white/10 hover:bg-brand-dark dark:hover:bg-white/20 text-brand-dark dark:text-white hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all">
                      Details
                  </RouterLink>
                </td>
              </tr>
            </template>
             <!-- Error Alert -->
            <template v-else-if="isError">
              <tr>
                <td colspan="3" class="px-4 py-16 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="bg-red-50 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-800/50">
                      <TriangleAlert class="h-8 w-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">Failed to load data</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      {{ error?.response?.data?.message || error?.message || 'An unexpected error occurred while fetching final inspection data.' }}
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
            <template v-else-if="!isLoading && !isError">
              <tr>
                <td colspan="3" class="px-4 py-16 text-center">
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
        v-model:limit="limitRef"
        :total-records="records.length"
      />
    </div>
  </div>
</template>
