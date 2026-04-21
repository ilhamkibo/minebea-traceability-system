<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePcbData } from '../composables/usePcbData'
import { useProcessName } from '@/composables/useProcessName'

const route = useRoute()
const { pcbRecords } = usePcbData()

const { processName } = useProcessName()

const filteredRecords = computed(() => {
  return pcbRecords.value.filter(pcb => 
    pcb.history.some(h => h.step.toLowerCase() === processName.value.toLowerCase())
  ).map(pcb => {
    const stepInfo = pcb.history.find(h => h.step.toLowerCase() === processName.value.toLowerCase())
    return {
      ...pcb,
      stepStatus: stepInfo?.status || 'N/A',
      stepTime: stepInfo?.time || ''
    }
  })
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div>
        <h3 class="text-lg lg:text-xl font-bold text-slate-800">{{ processName }} Monitoring</h3>
        <p class="text-[10px] lg:text-xs text-slate-500">List of PCBs processed through {{ processName }} station.</p>
      </div>
      <div class="flex space-x-2 overflow-x-auto">
        <div class="bg-white border border-slate-200 rounded-lg flex overflow-hidden whitespace-nowrap text-[10px] lg:text-xs">
           <button class="px-3 py-1.5 font-medium bg-slate-50 text-slate-600 border-r border-slate-200">All</button>
           <button class="px-3 py-1.5 font-medium hover:bg-slate-50 text-slate-600 border-r border-slate-200">OK</button>
           <button class="px-3 py-1.5 font-medium hover:bg-slate-50 text-slate-600">NG</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[9px] lg:text-[10px]">
              <th class="px-4 py-2.5 font-black">PCB ID</th>
              <th class="px-4 py-2.5 font-black">Process Time</th>
              <th class="px-4 py-2.5 font-black text-center">Result</th>
              <th class="px-4 py-2.5 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="pcb in filteredRecords" :key="pcb.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-4 py-2 font-bold text-slate-700">{{ pcb.id }}</td>
              <td class="px-4 py-2 text-slate-500 font-medium text-[10px] lg:text-xs">{{ new Date(pcb.stepTime).toLocaleString() }}</td>
              <td class="px-4 py-2 text-center">
                <span :class="pcb.stepStatus === 'OK' ? 'bg-emerald-200 text-emerald-700' : pcb.stepStatus === 'NG' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'" class="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] lg:text-[10px] font-black uppercase tracking-tighter">
                  {{ pcb.stepStatus }}
                </span>
              </td>
              <td class="px-4 py-2 text-right">
                 <RouterLink :to="{ name: 'Traceability', query: { qr: pcb.id }}" class="text-brand-accent hover:text-blue-700 font-bold text-[9px] lg:text-[10px] uppercase tracking-wider">
                    Details
                 </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
