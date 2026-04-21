<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePcbData, type PcbRecord } from '../composables/usePcbData'
import { Search, ChevronLeft, ChevronRight, ScanLine, X, QrCode, Route as RouteIcon } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { pcbRecords, findByQr } = usePcbData()

// Table and Pagination state
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 12

// Modal state
const isModalOpen = ref(false)
const selectedPcb = ref<PcbRecord | undefined>(undefined)

// Computed properties for Table
const filteredRecords = computed(() => {
  if (!searchQuery.value) return pcbRecords.value
  
  const query = searchQuery.value.toLowerCase()
  return pcbRecords.value.filter(pcb => 
    pcb.id.toLowerCase().includes(query) ||
    pcb.currentStatus.toLowerCase().includes(query) ||
    pcb.currentStep.toLowerCase().includes(query)
  )
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / itemsPerPage))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredRecords.value.slice(start, end)
})

const handleSearch = () => {
  currentPage.value = 1
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const goToPage = (page: number) => {
  currentPage.value = page
}

const openDetails = (pcb: PcbRecord) => {
  selectedPcb.value = pcb
  isModalOpen.value = true
  router.replace({ query: { qr: pcb.id }})
}

const closeModal = () => {
  isModalOpen.value = false
  router.replace({ query: {} })
}

onMounted(() => {
  if (route.query.qr) {
    const pcb = findByQr(route.query.qr as string)
    if (pcb) {
      openDetails(pcb)
      searchQuery.value = pcb.id
    }
  }
})

watch(() => route.query.qr, (newQr) => {
  if (newQr && (!selectedPcb.value || selectedPcb.value.id !== newQr)) {
    const pcb = findByQr(newQr as string)
    if (pcb) {
      openDetails(pcb)
    }
  } else if (!newQr) {
    isModalOpen.value = false
  }
})

// Optional pagination display logic for buttons
const pagesToShow = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i++) {
    if (Math.abs(i - currentPage.value) <= 1 || i === 1 || i === totalPages.value) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }
  return pages
})
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-4 pb-8">
    <div class="text-center space-y-1 mb-4">
      <h3 class="text-lg lg:text-xl font-black text-slate-800 tracking-tight">Traceability Engine</h3>
      <p class="text-[10px] lg:text-xs text-slate-500 px-4">Track every touchpoint of your PCB production line</p>
    </div>

    <!-- Search / Filter -->
    <div class="relative group max-w-md mx-auto px-2 lg:px-0">
      <input 
        v-model="searchQuery"
        @input="handleSearch"
        type="text" 
        placeholder="Filter by PCB ID, Status, or Step..."
        class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 pl-9 outline-none focus:border-brand-accent transition-all shadow-sm text-xs lg:text-sm"
      />
      <Search class="absolute left-4 lg:left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
    </div>

    <!-- PCB Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 text-slate-400 border-b border-slate-100 text-[9px] lg:text-[10px] uppercase tracking-wider">
              <th class="px-4 py-2.5 font-bold">PCB ID</th>
              <th class="px-4 py-2.5 font-bold">Current Step</th>
              <th class="px-4 py-2.5 font-bold hidden sm:table-cell">Last Update</th>
              <th class="px-4 py-2.5 font-bold">Status</th>
              <th class="px-4 py-2.5 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-[11px] lg:text-xs">
            <template v-if="paginatedRecords.length > 0">
              <tr v-for="pcb in paginatedRecords" :key="pcb.id" class="hover:bg-slate-50/70 transition-colors group">
                <td class="px-4 py-2.5 font-bold text-slate-800">{{ pcb.id }}</td>
                <td class="px-4 py-2.5 text-slate-600">{{ pcb.currentStep }}</td>
                <td class="px-4 py-2.5 text-slate-400 text-[10px] hidden sm:table-cell">
                  {{ new Date(pcb.lastUpdate).toLocaleString('en-GB') }}
                </td>
                <td class="px-4 py-2.5">
                  <span :class="pcb.currentStatus === 'OK' ? 'bg-emerald-200 text-emerald-700' : pcb.currentStatus === 'NG' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'" class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-tighter">
                    {{ pcb.currentStatus }}
                  </span>
                </td>
                <td class="px-4 py-2.5 text-center">
                  <button 
                    @click="openDetails(pcb)"
                    class="bg-brand-dark/5 hover:bg-brand-dark text-brand-dark hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                  >
                    Details
                  </button>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="5" class="p-6 text-center text-slate-400 text-xs text-medium">
                No PCBs found matching criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
        <span class="text-[10px] text-slate-500">
          Page <span class="font-bold text-slate-800">{{ currentPage }}</span> of <span class="font-bold text-slate-800">{{ totalPages }}</span>
        </span>
        <div class="flex items-center space-x-1">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          
          <template v-for="page in pagesToShow" :key="page">
            <span v-if="page === '...'" class="px-1 text-slate-400 text-xs">...</span>
            <button 
              v-else
              @click="goToPage(page as number)"
              :class="[
                'min-w-[24px] h-6 px-1 rounded-md text-[10px] font-bold transition-colors',
                currentPage === page ? 'bg-brand-dark text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              ]"
            >
               {{ page }}
            </button>
          </template>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for PCB Details -->
    <div v-if="isModalOpen && selectedPcb" class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="relative bg-slate-50 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 z-10 sticky top-0 shrink-0">
          <h3 class="text-sm font-black text-slate-800 flex items-center tracking-tight">
            <ScanLine class="text-brand-accent mr-1.5 w-4 h-4" />
            Timeline Details
          </h3>
          <button @click="closeModal" class="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
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
              <h4 class="text-lg lg:text-xl font-black tracking-tighter">{{ selectedPcb.id }}</h4>
            </div>
            <div class="relative z-10 text-right">
              <p class="text-[9px] text-slate-400 mb-1 uppercase tracking-widest font-black">Final Outcome</p>
              <span :class="selectedPcb.currentStatus === 'OK' ? 'bg-emerald-500' : selectedPcb.currentStatus === 'NG' ? 'bg-rose-500' : 'bg-slate-500'" class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                {{ selectedPcb.currentStatus }}
              </span>
            </div>
          </div>

          <!-- Timeline -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-5 relative z-0">
            <h5 class="font-bold text-slate-800 mb-4 flex items-center text-[11px] lg:text-xs">
              <RouteIcon class="mr-1.5 text-brand-accent w-3.5 h-3.5" />
              Journey Log
            </h5>
            
            <div class="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              <div v-for="(log, idx) in selectedPcb.history" :key="idx" class="relative group">
                <!-- Timeline Dot -->
                <div class="absolute -left-[17.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10"
                     :class="log.status === 'OK' ? 'bg-emerald-500' : 'bg-rose-500'">
                </div>
                
                <div class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div class="min-w-0">
                    <h6 class="font-bold text-slate-700 text-xs leading-tight">{{ log.step }}</h6>
                    <div class="flex items-center mt-0.5 text-slate-400 space-x-1.5">
                       <span class="text-[9px] font-bold uppercase tracking-wider">
                         {{ new Date(log.time).toLocaleDateString([], { month: 'short', day: 'numeric' }) }}
                       </span>
                       <span class="w-[3px] h-[3px] bg-slate-200 rounded-full"></span>
                       <span class="text-[9px] font-bold uppercase tracking-wider">
                         {{ new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                       </span>
                    </div>
                  </div>
                  <div class="flex items-center shrink-0">
                    <span :class="log.status === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'" class="inline-flex items-center justify-center rounded-md text-[8px] px-1.5 py-0.5 font-black uppercase tracking-tighter">
                      {{ log.status }}
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
