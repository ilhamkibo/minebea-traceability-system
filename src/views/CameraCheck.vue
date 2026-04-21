<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCameraChecks } from '@/hooks/useCameraChecks'
import { useDebounce } from '@/composables/useDebounce'

const searchRef = ref('')
const debouncedSearch = useDebounce(searchRef, 500)

const params = reactive({
  page: 1,
  limit: 10,
  judgement: '',
  date: '',
  search: debouncedSearch.value
})

watch(debouncedSearch, (newVal) => {
  params.search = newVal
  params.page = 1
})

const { data: cameraChecks, isLoading, isError } = useCameraChecks(params)

const setJudgement = (j: string) => {
  params.judgement = j
  params.page = 1
}

const handleDateChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  params.date = target.value
  params.page = 1
}

const records = computed(() => {
  // If the backend returns pagination structure, it might be in `data.data` or similar.
  // We'll adapt based on what cameraCheckService actually returns.
  // The service returns res.data.data directly, so cameraChecks.value is T[]
  if (Array.isArray(cameraChecks.value)) {
    return cameraChecks.value
  } else if (cameraChecks.value && cameraChecks.value.data) {
     return cameraChecks.value.data
  }
  return []
})

</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div>
        <h3 class="text-lg lg:text-xl font-bold text-slate-800">Camera Check Monitoring</h3>
        <p class="text-[10px] lg:text-xs text-slate-500">List of PCBs processed through Camera Check station.</p>
      </div>
      
      <div class="flex flex-wrap items-center gap-2">
        <input 
          v-model="searchRef"
          type="text" 
          placeholder="Search QR Code..." 
          class="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
        
        <input 
          :value="params.date"
          @change="handleDateChange"
          type="date" 
          class="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 text-slate-600"
        />

        <div class="bg-white border border-slate-200 rounded-lg flex overflow-hidden whitespace-nowrap text-[10px] lg:text-xs">
           <button @click="setJudgement('')" :class="params.judgement === '' ? 'bg-slate-100 font-bold' : 'bg-slate-50 font-medium'" class="px-3 py-1.5 text-slate-600 border-r border-slate-200 hover:bg-slate-100 transition-colors">All</button>
           <button @click="setJudgement('OK')" :class="params.judgement === 'OK' ? 'bg-slate-100 font-bold' : 'bg-slate-50 font-medium'" class="px-3 py-1.5 hover:bg-slate-100 text-slate-600 border-r border-slate-200 transition-colors">OK</button>
           <button @click="setJudgement('NG')" :class="params.judgement === 'NG' ? 'bg-slate-100 font-bold' : 'bg-slate-50 font-medium'" class="px-3 py-1.5 hover:bg-slate-100 text-slate-600 transition-colors">NG</button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div class="overflow-x-auto min-h-[300px]">
        <table class="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[9px] lg:text-[10px]">
              <th class="px-4 py-2.5 font-black">PCB ID / QR Code</th>
              <th class="px-4 py-2.5 font-black">Process Time</th>
              <th class="px-4 py-2.5 font-black text-center">Judgement</th>
              <th class="px-4 py-2.5 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="'skeleton-'+i" class="animate-pulse">
                <td class="px-4 py-3"><div class="h-4 bg-slate-200 rounded w-24"></div></td>
                <td class="px-4 py-3"><div class="h-3 bg-slate-200 rounded w-32"></div></td>
                <td class="px-4 py-3 text-center"><div class="h-4 bg-slate-200 rounded-full w-12 mx-auto"></div></td>
                <td class="px-4 py-3 text-right"><div class="h-3 bg-slate-200 rounded w-16 ml-auto"></div></td>
              </tr>
            </template>
            <template v-else-if="records.length > 0">
              <tr v-for="pcb in records" :key="pcb.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-2 font-bold text-slate-700">{{ pcb.qrCode }}</td>
                <td class="px-4 py-2 text-slate-500 font-medium text-[10px] lg:text-xs">{{ pcb.timestamp ? new Date(pcb.timestamp).toLocaleString() : '-' }}</td>
                <td class="px-4 py-2 text-center">
                  <span :class="pcb.judgement === 'OK' ? 'bg-emerald-200 text-emerald-700' : pcb.judgement === 'NG' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'" class="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] lg:text-[10px] font-black uppercase tracking-tighter">
                    {{ pcb.judgement }}
                  </span>
                </td>
                <td class="px-4 py-2 text-right">
                  <RouterLink :to="{ name: 'Traceability', query: { qr: pcb.qrCode }}" class="text-brand-accent hover:text-blue-700 font-bold text-[9px] lg:text-[10px] uppercase tracking-wider">
                      Details
                  </RouterLink>
                </td>
              </tr>
            </template>
            <template v-else-if="!isLoading">
              <tr>
                <td colspan="4" class="px-4 py-10 text-center text-slate-400 font-medium">No records found.</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Placeholder simple pagination if structure fits -->
      <div v-if="!isLoading && records.length > 0" class="p-4 border-t border-slate-100 flex items-center justify-between">
        <span class="text-xs text-slate-500">Page {{ params.page }}</span>
        <div class="flex space-x-1">
          <button 
            @click="params.page = (params.page || 1) - 1" 
            :disabled="(params.page || 1) <= 1"
            class="px-3 py-1 border border-slate-200 rounded text-xs font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Prev
          </button>
          <button 
            @click="params.page = (params.page || 1) + 1" 
            class="px-3 py-1 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
