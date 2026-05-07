<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePcbsList } from '@/hooks/usePcbQueries'
import { useDebounce } from '@/composables/useDebounce'
import { TriangleAlert } from 'lucide-vue-next'
import Pagination from '@/components/Pagination.vue'

const searchRef = ref('')
const debouncedSearch = useDebounce(searchRef, 500)

const params = reactive({
  page: 1,
  limit: 10,
  datetime: '',
  search: debouncedSearch.value
})

watch(debouncedSearch, (newVal) => {
  params.search = newVal
  params.page = 1
})

const { data: pcbResponse, isLoading, isError, error, refetch } = usePcbsList(params)

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

const handleDateChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  params.datetime = target.value
  params.page = 1
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
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
              <th rowspan="2" class="px-4 py-2.5 font-black border-r align-middle border-b border-slate-50 dark:border-slate-700/50">QR Code</th>
              <th colspan="2" class="px-4 py-1.5 font-black text-center border-r border-b border-slate-100 dark:border-slate-700">Camera Check</th>
              <th colspan="2" class="px-4 py-1.5 font-black text-center border-r border-b border-slate-100 dark:border-slate-700">Visual Check</th>
              <th colspan="2" class="px-4 py-1.5 font-black text-center border-r border-b border-slate-100 dark:border-slate-700">Touch Up</th>
              <th colspan="2" class="px-4 py-1.5 font-black text-center border-r border-b border-slate-100 dark:border-slate-700">ROM Scan</th>
              <th colspan="2" class="px-4 py-1.5 font-black text-center border-b border-r border-slate-100 dark:border-slate-700">Final Inspect</th>
              <th rowspan="2" class="px-4 py-2.5 font-black text-center align-middle border-b border-slate-50 dark:border-slate-700/50">Actions</th>
            </tr>
            <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[8px] lg:text-[9px]">
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-50 dark:border-slate-700/50">Time</th>
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-100 dark:border-slate-700">Result</th>
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-50 dark:border-slate-700/50">Time</th>
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-100 dark:border-slate-700">Result</th>
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-50 dark:border-slate-700/50">Time</th>
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-100 dark:border-slate-700">Result</th>
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-50 dark:border-slate-700/50">Time</th>
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-100 dark:border-slate-700">Result</th>
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-50 dark:border-slate-700/50">Time</th>
              <th class="px-3 py-1.5 font-bold text-center border-r border-b border-slate-50 dark:border-slate-700/50">Result</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <!-- Loading skeleton -->
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="'skeleton-'+i" class="animate-pulse">
                <td class="px-4 py-3"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                <td class="px-3 py-3" v-for="j in 10" :key="'sk-'+j"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-14 mx-auto"></div></td>
                <td class="px-4 py-3 text-right"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-14 ml-auto"></div></td>
              </tr>
            </template>

            <!-- Data rows -->
            <template v-else-if="records.length > 0">
              <tr v-for="pcb in records" :key="pcb.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                <!-- QR Code -->
                <td class="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-200 border-r border-slate-50 dark:border-slate-700/50">{{ pcb.value }}</td>

                <!-- Camera Check -->
                <td class="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-[10px] text-center border-r border-slate-50 dark:border-slate-700/50">
                  {{ pcb.cameraChecks?.[0] ? formatDate(pcb.cameraChecks[0].createdAt) : '-' }}
                </td>
                <td class="px-3 py-2.5 text-center border-r border-slate-100 dark:border-slate-700">
                  <span v-if="pcb.cameraChecks?.[0]" :class="pcb.cameraChecks[0].judgement === 'OK' ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-100 text-rose-700'" class="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[8px] lg:text-[9px] font-black uppercase tracking-tighter">
                    {{ pcb.cameraChecks[0].judgement }}
                  </span>
                  <span v-else class="text-slate-300 dark:text-slate-600 text-[10px]">-</span>
                </td>

                <!-- Visual Check -->
                <td class="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-[10px] text-center border-r border-slate-50 dark:border-slate-700/50">
                  {{ pcb.visualChecks?.[0] ? formatDate(pcb.visualChecks[0].createdAt) : '-' }}
                </td>
                <td class="px-3 py-2.5 text-center border-r border-slate-100 dark:border-slate-700">
                  <span v-if="pcb.visualChecks?.[0]" :class="pcb.visualChecks[0].judgement === 'OK' ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-100 text-rose-700'" class="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[8px] lg:text-[9px] font-black uppercase tracking-tighter">
                    {{ pcb.visualChecks[0].judgement }}
                  </span>
                  <span v-else class="text-slate-300 dark:text-slate-600 text-[10px]">-</span>
                </td>

                <!-- Touch Up -->
                <td class="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-[10px] text-center border-r border-slate-50 dark:border-slate-700/50">
                  {{ pcb.touchUps?.[0] ? formatDate(pcb.touchUps[0].createdAt) : '-' }}
                </td>
                <td class="px-3 py-2.5 text-center border-r border-slate-100 dark:border-slate-700">
                  <span v-if="pcb.touchUps?.[0]" class="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[8px] lg:text-[9px] font-black uppercase tracking-tighter bg-blue-100 text-blue-700">
                    Done
                  </span>
                  <span v-else class="text-slate-300 dark:text-slate-600 text-[10px]">-</span>
                </td>

                <!-- ROM Scan -->
                <td class="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-[10px] text-center border-r border-slate-50 dark:border-slate-700/50">
                  {{ pcb.romScans?.[0] ? formatDate(pcb.romScans[0].createdAt) : '-' }}
                </td>
                <td class="px-3 py-2.5 text-center border-r border-slate-100 dark:border-slate-700">
                  <span v-if="pcb.romScans?.[0]" class="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[8px] lg:text-[9px] font-black uppercase tracking-tighter bg-blue-100 text-blue-700">
                    Done
                  </span>
                  <span v-else class="text-slate-300 dark:text-slate-600 text-[10px]">-</span>
                </td>

                <!-- Final Inspect -->
                <td class="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-[10px] text-center border-r border-slate-50 dark:border-slate-700/50">
                  {{ pcb.finalInspecs?.[0] ? formatDate(pcb.finalInspecs[0].createdAt) : '-' }}
                </td>
                <td class="px-3 py-2.5 text-center border-r border-slate-100 dark:border-slate-700">
                  <span v-if="pcb.finalInspecs?.[0]" class="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[8px] lg:text-[9px] font-black uppercase tracking-tighter bg-blue-100 text-blue-700">
                    Done
                  </span>
                  <span v-else class="text-slate-300 dark:text-slate-600 text-[10px]">-</span>
                </td>

                <!-- Actions -->
                <td class="px-4 py-2.5 text-center">
                  <RouterLink :to="{ name: 'Traceability', query: { id: pcb.id }}" class="bg-brand-dark/5 dark:bg-white/10 hover:bg-brand-dark dark:hover:bg-white/20 text-brand-dark dark:text-white hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all">
                    Details
                  </RouterLink>
                </td>
              </tr>
            </template>

            <!-- Error Alert -->
            <template v-else-if="isError">
              <tr>
                <td colspan="12" class="px-4 py-16 text-center">
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
                <td colspan="12" class="px-4 py-10 text-center text-slate-400 font-medium">No records found.</td>
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