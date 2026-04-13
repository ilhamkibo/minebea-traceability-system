<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePcbData } from '../composables/usePcbData'

const route = useRoute()
const { pcbRecords } = usePcbData()

const processName = computed(() => {
  return route.params.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})

const filteredRecords = computed(() => {
  return pcbRecords.value.filter(pcb => 
    pcb.history.some(h => h.step.toLowerCase() === processName.value.toLowerCase())
  ).map(pcb => {
    const stepInfo = pcb.history.find(h => h.step.toLowerCase() === processName.value.toLowerCase())
    return {
      ...pcb,
      stepStatus: stepInfo.status,
      stepTime: stepInfo.time
    }
  })
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-2xl font-bold text-slate-800">{{ processName }} Monitoring</h3>
        <p class="text-slate-500">List of PCBs processed through {{ processName }} station.</p>
      </div>
      <div class="flex space-x-2">
        <div class="bg-white border border-slate-200 rounded-lg flex overflow-hidden">
           <button class="px-4 py-2 text-sm font-medium bg-slate-50 text-slate-600 border-r border-slate-200">All</button>
           <button class="px-4 py-2 text-sm font-medium hover:bg-slate-50 text-slate-600 border-r border-slate-200">OK</button>
           <button class="px-4 py-2 text-sm font-medium hover:bg-slate-50 text-slate-600">NG</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="text-slate-400 border-b border-slate-100">
              <th class="pb-4 font-medium">PCB ID</th>
              <th class="pb-4 font-medium">Process Time</th>
              <th class="pb-4 font-medium">Result</th>
              <th class="pb-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="pcb in filteredRecords" :key="pcb.id" class="hover:bg-slate-50/50">
              <td class="py-4 font-bold text-slate-700">{{ pcb.id }}</td>
              <td class="py-4 text-slate-500">{{ new Date(pcb.stepTime).toLocaleString() }}</td>
              <td class="py-4">
                <span :class="pcb.stepStatus === 'OK' ? 'badge badge-success' : 'badge badge-error'">
                  {{ pcb.stepStatus }}
                </span>
              </td>
              <td class="py-4">
                 <RouterLink :to="{ name: 'Traceability', query: { qr: pcb.id }}" class="text-brand-accent hover:text-blue-700 font-bold">
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
