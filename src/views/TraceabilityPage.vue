<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePcbsList, usePcbDetail } from '@/hooks/usePcbQueries'
import { useDebounce } from '@/composables/useDebounce'
import Pagination from '@/components/Pagination.vue'
import { Search, ScanLine, X, QrCode, Route as RouteIcon, SearchX, TriangleAlert } from 'lucide-vue-next'
import { getTodayDate, getYesterdayDate, getLast7DaysDate, getThisMonthStartDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()

// Table and Pagination state
const searchRef = ref('')
const debouncedSearch = useDebounce(searchRef, 500)
const limitRef = ref(10)
const isSingleDay = ref(true)

const params = reactive({
  page: 1,
  limit: limitRef.value,
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

watch(limitRef, (newVal) => {
  params.limit = newVal
  params.page = 1
})

const { data: pcbResponse, isLoading: isLoadingPcbs, isError, error, refetch } = usePcbsList(params)

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

// Modal state
const isModalOpen = ref(false)
const selectedPcbId = ref<number | undefined>(undefined)

const { data: selectedPcbDetail, isLoading: isLoadingDetail } = usePcbDetail(selectedPcbId)

const openDetails = (id: number) => {
  selectedPcbId.value = id
  isModalOpen.value = true
  router.replace({ query: { id: id.toString() }})
}

const closeModal = () => {
  isModalOpen.value = false
  router.replace({ query: {} })
}

onMounted(() => {
  if (route.query.id) {
    const id = parseInt(route.query.id as string)
    if (!isNaN(id)) {
      openDetails(id)
    }
  }
})

watch(() => route.query.id, (newId) => {
  if (newId) {
    const id = parseInt(newId as string)
    if (!isNaN(id) && selectedPcbId.value !== id) {
      openDetails(id)
    }
  } else {
    isModalOpen.value = false
  }
})

const handleDateChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  params.datetime = target.value
  params.page = 1
  const quickFilter = document.getElementById('quick-filter-2') as HTMLSelectElement
  if (quickFilter) quickFilter.value = 'custom'
}

const handleDateToChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  params.datetimeto = target.value
  params.page = 1
  const quickFilter = document.getElementById('quick-filter-2') as HTMLSelectElement
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
</script>

<template>
  <div class="mx-auto space-y-4 pb-8">
    <div class="text-center space-y-1 mb-4">
      <h3 class="text-lg lg:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Traceability Engine</h3>
      <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 px-4">Track every touchpoint of your PCB production line</p>
    </div>

    <div class="flex flex-wrap gap-4 items-center justify-center">
      <!-- Search / Filter -->
      <div class="relative w-full group max-w-md px-2 lg:px-0">
        <input 
          v-model="searchRef"
          type="text" 
          placeholder="Filter by PCB ID, Status, or Step..."
          class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pl-9 outline-none focus:border-brand-accent transition-all shadow-sm text-xs lg:text-sm text-slate-800 dark:text-slate-200"
        />
        <Search class="absolute left-4 lg:left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
      </div>
      <!-- Filter date -->
      <div class="flex items-center gap-2">
        <select 
          id="quick-filter-2"
          @change="handleQuickFilter"
          class="w-full sm:w-auto text-xs lg:text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl focus:outline-none focus:border-brand-accent transition-colors cursor-pointer shadow-sm"
        >
          <option value="custom" disabled hidden selected>Quick Filter</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 Days</option>
          <option value="thismonth">This Month</option>
        </select>

        <div class="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 shadow-sm">
          <input 
            :value="params.datetime"
            @change="handleDateChange"
            type="date" 
            :max="getTodayDate()"
            class="text-xs lg:text-sm px-1 py-1 bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
          />
          <span class="text-slate-300 dark:text-slate-600 font-medium text-xs">to</span>
          <input 
            :value="params.datetimeto"
            @change="handleDateToChange"
            type="date" 
            :max="getTodayDate()"
            :disabled="isSingleDay"
            :class="isSingleDay ? 'opacity-50 cursor-not-allowed' : ''"
            class="text-xs lg:text-sm px-1 py-1 bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
          />
          <label class="flex items-center gap-1.5 ml-1 border-l border-slate-200 dark:border-slate-700 pl-3 cursor-pointer group">
            <div class="relative flex items-center justify-center w-3.5 h-3.5 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-brand-accent transition-colors overflow-hidden">
              <input type="checkbox" v-model="isSingleDay" class="absolute opacity-0 w-full h-full cursor-pointer z-10" />
              <svg v-if="isSingleDay" class="w-2.5 h-2.5 text-brand-accent absolute pointer-events-none" viewBox="0 0 14 14" fill="none">
                <path d="M3 8L6 11L11 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 font-medium select-none group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">1 Day</span>
          </label>
        </div>
      </div>
    </div>

    <!-- PCB Data Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both transition-colors">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 text-[9px] lg:text-[10px] uppercase tracking-wider">
              <th class="px-4 py-2.5 font-bold">PCB ID</th>
              <th class="px-4 py-2.5 font-bold">Current Step</th>
              <th class="px-4 py-2.5 font-bold hidden sm:table-cell">Last Update</th>
              <th class="px-4 py-2.5 font-bold">Status</th>
              <th class="px-4 py-2.5 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50 text-[11px] lg:text-xs">
            <template v-if="isLoadingPcbs">
              <tr v-for="i in 5" :key="'skeleton-'+i" class="animate-pulse">
                <td class="px-4 py-3"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                <td class="px-4 py-3"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                <td class="px-4 py-3 hidden sm:table-cell"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                <td class="px-4 py-3"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-12 mx-auto"></div></td>
                <td class="px-4 py-3 text-center"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div></td>
              </tr>
            </template>
            <template v-else-if="records.length > 0">
              <tr v-for="pcb in records" :key="pcb.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors group">
                <td class="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">{{ pcb.value }}</td>
                <td class="px-4 py-2.5 text-slate-600 dark:text-slate-300">{{ pcb.lastAppearance }}</td>
                <td class="px-4 py-2.5 text-slate-400 text-[10px] hidden sm:table-cell">
                  {{ new Date(pcb.createdAt).toLocaleString('en-GB') }}
                </td>
                <td class="px-4 py-2.5">
                  <span :class="pcb.itemStatus === 'OK' ? 'bg-emerald-200 text-emerald-700' : pcb.itemStatus === 'NG' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'" class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-tighter">
                    {{ pcb.itemStatus }}
                  </span>
                </td>
                <td class="px-4 py-2.5 text-center">
                  <button 
                    @click="openDetails(pcb.id)"
                    class="bg-brand-dark/5 dark:bg-white/10 hover:bg-brand-dark dark:hover:bg-white/20 text-brand-dark dark:text-white hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                  >
                    Details
                  </button>
                </td>
              </tr>
            </template>

            <!-- Error Alert -->
            <template v-else-if="isError">
              <tr>
                <td colspan="5" class="px-4 py-16 text-center border border-slate-200 dark:border-slate-700">
                  <div class="flex flex-col items-center justify-center">
                    <div class="bg-red-50 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-800/50">
                      <TriangleAlert class="h-8 w-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">Failed to load data</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      {{ (error as any)?.response?.data?.message || (error as any)?.message || 'An unexpected error occurred while fetching PCBs.' }}
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
            <template v-else-if="!isLoadingPcbs && !isError">
              <tr>
                <td colspan="5" class="px-4 py-16 text-center border border-slate-200 dark:border-slate-700">
                  <div class="flex flex-col items-center justify-center">
                    <div class="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700/50">
                      <SearchX class="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">No PCBs found</h4>
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
        v-if="!isLoadingPcbs && records.length > 0"
        :meta="paginationMeta"
        v-model:page="params.page"
        v-model:limit="limitRef"
        :total-records="records.length"
      />
    </div>

    <!-- Modal for PCB Details -->
    <div v-if="isModalOpen && selectedPcbDetail" class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="relative bg-slate-50 dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 z-10 sticky top-0 shrink-0 transition-colors">
          <h3 class="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center tracking-tight">
            <ScanLine class="text-brand-accent mr-1.5 w-4 h-4" />
            Timeline Details
          </h3>
          <button @click="closeModal" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>
        
        <div class="overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1">
          <!-- ID Card -->
          <div class="bg-brand-dark text-white shadow-md overflow-hidden relative p-4 rounded-xl flex items-center justify-between">
            <div class="absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-5 pointer-events-none">
               <QrCode class="w-20 h-20" />
            </div>
            <div class="relative z-10">
              <p class="text-[9px] text-slate-400 mb-0.5 uppercase tracking-widest font-black">Serial Number</p>
              <h4 class="text-lg lg:text-xl font-black tracking-tighter">{{ selectedPcbDetail.value }}</h4>
            </div>
            <div class="relative z-10 text-right">
              <p class="text-[9px] text-slate-400 mb-1 uppercase tracking-widest font-black">Final Outcome</p>
              <span :class="selectedPcbDetail.itemStatus === 'OK' ? 'bg-emerald-500' : selectedPcbDetail.itemStatus === 'NG' ? 'bg-rose-500' : 'bg-slate-500'" class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                {{ selectedPcbDetail.itemStatus }}
              </span>
            </div>
          </div>

          <!-- Timeline -->
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 lg:p-5 relative z-0 transition-colors">
            <h5 class="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center text-[11px] lg:text-xs">
              <RouteIcon class="mr-1.5 text-brand-accent w-3.5 h-3.5" />
              Journey Log
            </h5>
            
            <div class="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700">
              <div v-for="(log, idx) in selectedPcbDetail.timeLine" :key="idx" class="relative group">
                <!-- Timeline Dot -->
                <div class="absolute -left-[17.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10"
                     :class="log.passed ? 'bg-emerald-500' : 'bg-rose-500'">
                </div>
                
                <div class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div class="min-w-0">
                    <h6 class="font-bold text-slate-700 dark:text-slate-200 text-xs leading-tight">{{ log.workFlowEventName }} [{{ log.operatorName }}]</h6>
                    <div class="flex items-center mt-0.5 text-slate-400 dark:text-slate-500 space-x-1.5">
                       <span class="text-[9px] font-bold uppercase tracking-wider">
                         {{ new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) }}
                       </span>
                       <span class="w-[3px] h-[3px] bg-slate-200 rounded-full"></span>
                       <span class="text-[9px] font-bold uppercase tracking-wider">
                         {{ new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                       </span>
                    </div>
                  </div>
                  <div class="flex items-center shrink-0">
                    <span :class="log.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'" class="inline-flex items-center justify-center rounded-md text-[8px] px-1.5 py-0.5 font-black uppercase tracking-tighter">
                      {{ log.passed ? 'OK' : 'NG' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
