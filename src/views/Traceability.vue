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
  // Update URL for shareability
  router.replace({ query: { qr: searchQuery.value }})
}

onMounted(() => {
  if (route.query.qr) {
    searchQuery.value = route.query.qr
    handleSearch()
  }
})

// Listen for query changes
watch(() => route.query.qr, (newQr) => {
  if (newQr) {
    searchQuery.value = newQr
    searchResult.value = findByQr(newQr)
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="text-center space-y-2">
      <h3 class="text-2xl font-bold text-slate-800">PCB Traceability Search</h3>
      <p class="text-slate-500 font-medium">Enter QR Code to track production lifecycle</p>
    </div>

    <!-- Search Box -->
    <div class="relative group max-w-xl mx-auto">
      <input 
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        type="text" 
        placeholder="Scan or Type QR Code (e.g. PCB-0001)..."
        class="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 pl-14 outline-none focus:border-brand-accent transition-all shadow-sm group-hover:shadow-md"
      />
      <span class="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">qr_code_2</span>
      <button 
        @click="handleSearch"
        class="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-dark text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
      >
        Track
      </button>
    </div>

    <!-- Search Results -->
    <div v-if="searchResult" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="card flex flex-col md:flex-row justify-between items-center bg-brand-dark text-white border-none shadow-xl overflow-hidden relative">
        <div class="absolute top-0 right-0 p-8 opacity-10">
           <span class="material-icons text-9xl">qr_code_2</span>
        </div>
        <div class="relative z-10 text-center md:text-left">
          <p class="text-xs text-slate-400 uppercase tracking-widest font-bold">PCB Identifier</p>
          <h4 class="text-4xl font-black mt-1 tracking-tight">{{ searchResult.id }}</h4>
        </div>
        <div class="relative z-10 mt-4 md:mt-0 text-center md:text-right">
          <p class="text-xs text-slate-400 mb-2">Process Milestone</p>
          <div class="flex items-center space-x-2">
             <span :class="searchResult.currentStatus === 'OK' ? 'bg-emerald-500' : 'bg-rose-500'" class="px-4 py-2 rounded-lg text-sm font-black border-none uppercase tracking-wider">
               {{ searchResult.currentStatus }}
             </span>
          </div>
        </div>
      </div>

      <div class="card">
        <h5 class="font-bold text-slate-800 mb-10 flex items-center">
          <span class="material-icons mr-2 text-brand-accent">timeline</span>
          Production Journey
        </h5>
        
        <div class="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          <div v-for="(log, idx) in searchResult.history" :key="idx" class="relative group">
            <!-- Timeline Dot -->
            <div class="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-all group-hover:scale-125 z-10"
                 :class="log.status === 'OK' ? 'bg-emerald-500' : 'bg-rose-500'">
            </div>
            
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div>
                <h6 class="font-bold text-slate-800 text-lg leading-none">{{ log.step }}</h6>
                <p class="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">{{ new Date(log.time).toLocaleDateString() }} @ {{ new Date(log.time).toLocaleTimeString() }}</p>
              </div>
              <div class="flex items-center">
                <span :class="log.status === 'OK' ? 'badge badge-success' : 'badge badge-error'" class="text-xs px-3 py-1 uppercase tracking-tighter">
                  Result: {{ log.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="searchQuery && !searchResult" class="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100 shadow-sm">
       <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="material-icons text-4xl text-slate-300">sentiment_dissatisfied</span>
       </div>
       <h4 class="text-xl font-bold text-slate-800">No History Found</h4>
       <p class="text-slate-500 max-w-xs mx-auto mt-2">We couldn't find any production records for the QR code "<span class="font-bold text-slate-700">{{ searchQuery }}</span>".</p>
       <button @click="searchQuery = ''" class="mt-8 text-brand-accent font-bold hover:underline">Clear Search</button>
    </div>
    
    <!-- Initial State -->
    <div v-else class="text-center py-20">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
           <div class="p-4 bg-white rounded-2xl border border-slate-100"><span class="material-icons text-3xl">camera</span></div>
           <div class="p-4 bg-white rounded-2xl border border-slate-100"><span class="material-icons text-3xl">visibility</span></div>
           <div class="p-4 bg-white rounded-2xl border border-slate-100"><span class="material-icons text-3xl">build</span></div>
           <div class="p-4 bg-white rounded-2xl border border-slate-100"><span class="material-icons text-3xl">memory</span></div>
        </div>
    </div>
  </div>
</template>
