<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePcbData } from '../composables/usePcbData'

const route = useRoute()
const router = useRouter()
const { findByQr } = usePcbData()

const searchQuery = ref('')
const searchResult = ref(null)

const handleSearch = () => {
  if (!searchQuery.value) return
  searchResult.value = findByQr(searchQuery.value)
  router.replace({ query: { qr: searchQuery.value }})
}

onMounted(() => {
  if (route.query.qr) {
    searchQuery.value = route.query.qr
    handleSearch()
  }
})

watch(() => route.query.qr, (newQr) => {
  if (newQr) {
    searchQuery.value = newQr
    searchResult.value = findByQr(newQr)
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 lg:space-y-8">
    <div class="text-center space-y-2">
      <h3 class="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">Traceability Engine</h3>
      <p class="text-xs lg:text-sm text-slate-500 font-medium px-4">Track every touchpoint of your PCB production line</p>
    </div>

    <!-- Search Box -->
    <div class="relative group max-w-xl mx-auto px-2 lg:px-0">
      <input 
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        type="text" 
        placeholder="Enter PCB ID (e.g. PCB-0001)..."
        class="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 lg:px-6 py-3 lg:py-4 pl-12 lg:pl-14 outline-none focus:border-brand-accent transition-all shadow-sm group-hover:shadow-md text-sm lg:text-base"
      />
      <span class="material-icons absolute left-6 lg:left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xl lg:text-2xl">qr_code_2</span>
      <button 
        @click="handleSearch"
        class="absolute right-4 lg:right-3 top-1/2 -translate-y-1/2 bg-brand-dark text-white px-4 lg:px-6 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-bold hover:bg-slate-800 transition-colors"
      >
        Track
      </button>
    </div>

    <!-- Search Results -->
    <div v-if="searchResult" class="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- ID Card -->
      <div class="card flex flex-col md:flex-row justify-between items-center bg-brand-dark text-white border-none shadow-xl overflow-hidden relative p-6 lg:p-8">
        <div class="absolute top-0 right-0 p-8 opacity-5">
           <span class="material-icons text-[120px] lg:text-[150px]">qr_code_2</span>
        </div>
        <div class="relative z-10 text-center md:text-left mb-4 md:mb-0">
          <p class="text-[10px] lg:text-xs text-slate-400 uppercase tracking-widest font-black">Serial Number</p>
          <h4 class="text-3xl lg:text-4xl font-black mt-1 tracking-tighter">{{ searchResult.id }}</h4>
        </div>
        <div class="relative z-10 text-center md:text-right">
          <p class="text-[10px] lg:text-xs text-slate-400 mb-2 uppercase tracking-widest font-black">Final Outcome</p>
          <span :class="searchResult.currentStatus === 'OK' ? 'bg-emerald-500' : 'bg-rose-500'" class="px-5 lg:px-6 py-2 rounded-xl text-sm lg:text-base font-black uppercase tracking-wider shadow-lg">
            {{ searchResult.currentStatus }}
          </span>
        </div>
      </div>

      <!-- Timeline -->
      <div class="card lg:p-10">
        <h5 class="font-bold text-slate-800 mb-8 lg:mb-12 flex items-center text-sm lg:text-lg">
          <span class="material-icons mr-2 text-brand-accent">alt_route</span>
          Production Journey
        </h5>
        
        <div class="relative pl-6 lg:pl-10 space-y-10 lg:space-y-14 before:content-[''] before:absolute before:left-[11px] lg:before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          <div v-for="(log, idx) in searchResult.history" :key="idx" class="relative group">
            <!-- Timeline Dot -->
            <div class="absolute -left-[23px] lg:-left-[31px] top-1 w-3.5 lg:w-5 h-3.5 lg:h-5 rounded-full border-[3px] lg:border-4 border-white shadow-sm transition-all group-hover:scale-125 z-10"
                 :class="log.status === 'OK' ? 'bg-emerald-500' : 'bg-rose-500'">
            </div>
            
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 lg:gap-4 p-4 lg:p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div class="min-w-0">
                <h6 class="font-bold text-slate-800 text-base lg:text-xl leading-none tracking-tight">{{ log.step }}</h6>
                <div class="flex items-center mt-3 text-slate-400 space-x-3">
                   <div class="flex items-center text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                     <span class="material-icons text-sm mr-1">event</span>
                     {{ new Date(log.time).toLocaleDateString() }}
                   </div>
                   <div class="flex items-center text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                     <span class="material-icons text-sm mr-1">schedule</span>
                     {{ new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                   </div>
                </div>
              </div>
              <div class="flex items-center shrink-0">
                <span :class="log.status === 'OK' ? 'badge badge-success' : 'badge badge-error'" class="text-[10px] lg:text-xs px-3 py-1 lg:px-4 lg:py-1.5 font-black uppercase tracking-tighter">
                  {{ log.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty/Initial States remain same but with responsive spacing -->
  </div>
</template>
