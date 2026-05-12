<script setup lang="ts">
import { useCurrentOperators } from '@/hooks/useOperators';
import { Camera, Eye, Pencil, MemoryStick, Glasses } from 'lucide-vue-next'
import { computed } from 'vue';

const STATIONS = [
  { key: 'CameraCheck', label: 'Camera Check', color: 'bg-blue-500 dark:bg-blue-400', icon: Camera },
  { key: 'VisualCheck', label: 'Visual Check', color: 'bg-green-500 dark:bg-green-400', icon: Eye },
  { key: 'TouchUp', label: 'Touch Up', color: 'bg-orange-500 dark:bg-orange-400', icon: Pencil },
  // TODO(romscan): RomScan station not yet implemented — uncomment when RomScan is ready
  // { key: 'RomScan', label: 'ROM Writing', color: 'bg-purple-500 dark:bg-purple-400', icon: MemoryStick },
  { key: 'FinalInspect', label: 'Final Inspection', color: 'bg-red-500 dark:bg-red-400', icon: Glasses },
]

const { data: userCurrent, isLoading } = useCurrentOperators(60000)

const currentOperators = computed(() => {
  return userCurrent.value?.data?.operators || []
})

const displayCards = computed(() => {
  return STATIONS.map((station, index) => {
    const assignedOperator = currentOperators.value.find(op => 
      op.workPosition && op.workPosition.includes(station.key)
    )
    return {
      id: index + 1,
      station: station.label,
      operator: assignedOperator ? assignedOperator.name : 'Unassigned',
      color: station.color,
      icon: station.icon
    }
  })
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
    <div
      v-for="op in displayCards"
      :key="op.id"
      class="group bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-lg px-3 py-2.5 hover:shadow-sm transition-all"
    >
      <div class="flex items-center gap-3">
        <div :class="`w-9 h-9 rounded-lg ${op.color} flex items-center justify-center shrink-0 shadow-sm`">
          <component :is="op.icon" class="w-5 h-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ op.station }}</p>
          <div class="flex items-center gap-1.5 mt-0.5">
             <div v-if="isLoading" class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
             <p v-else class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" :class="{ 'text-slate-400 dark:text-slate-500 italic': op.operator === 'Unassigned' }">{{ op.operator }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
