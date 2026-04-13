<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePcbData } from '../composables/usePcbData'

const route = useRoute()
const { pcbRecords } = usePcbData()

const processName = computed(() => {
  const id = route.params.id as string
  return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})

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
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h3 class="text-xl lg:text-2xl font-bold text-slate-800">{{ processName }} Monitoring</h3>
        <p class="text-xs lg:text-sm text-slate-500">List of PCBs processed through {{ processName }} station.</p>
      </div>
      <div class="flex space-x-2 overflow-x-auto">
        <div class="bg-white border border-slate-200 rounded-lg flex overflow-hidden whitespace-nowrap">
           <button class="px-4 py-2 text-xs font-medium bg-slate-50 text-slate-600 border-r border-slate-200">All</button>
           <button class="px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-600 border-r border-slate-200">OK</button>
           <button class="px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-600">NG</button>
        </div>
      </div>
    </div>

    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs lg:text-sm whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] lg:text-xs">
              <th class="px-4 lg:px-6 py-4 font-black">PCB ID</th>
              <th class="px-4 lg:px-6 py-4 font-black">Process Time</th>
              <th class="px-4 lg:px-6 py-4 font-black text-center">Result</th>
              <th class="px-4 lg:px-6 py-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="pcb in filteredRecords" :key="pcb.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-4 lg:px-6 py-4 font-bold text-slate-700">{{ pcb.id }}</td>
              <td class="px-4 lg:px-6 py-4 text-slate-500 font-medium">{{ new Date(pcb.stepTime).toLocaleString() }}</td>
              <td class="px-4 lg:px-6 py-4 text-center">
                <span :class="pcb.stepStatus === 'OK' ? 'badge badge-success' : 'badge badge-error'" class="px-3">
                  {{ pcb.stepStatus }}
                </span>
              </td>
              <td class="px-4 lg:px-6 py-4 text-right">
                 <RouterLink :to="{ name: 'Traceability', query: { qr: pcb.id }}" class="text-brand-accent hover:text-blue-700 font-bold text-xs uppercase tracking-wider">
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
