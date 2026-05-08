<script setup lang="ts">
import { RouterLink } from 'vue-router'

const props = defineProps<{
  pcb: any
}>()

const getMaxRows = (pcb: any) => {
  return Math.max(
    1,
    pcb.cameraChecks?.length || 0,
    pcb.visualChecks?.length || 0,
    pcb.touchUps?.length || 0,
    pcb.romScans?.length || 0,
    pcb.finalInspecs?.length || 0
  )
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
  <template v-for="rowIndex in getMaxRows(pcb)" :key="`${pcb.id}-${rowIndex}`">
    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <!-- QR Code -->
      <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" class="px-4 py-3 font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 align-top whitespace-nowrap text-[13px] bg-white dark:bg-slate-800">
        {{ pcb.value }}
      </td>

      <!-- Camera Check -->
      <template v-if="pcb.cameraChecks && pcb.cameraChecks[rowIndex - 1]">
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.cameraChecks[rowIndex - 1].createdAt) }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.cameraChecks[rowIndex - 1].operatorName }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold" :class="pcb.cameraChecks[rowIndex - 1].judgement === 'OK' ? 'text-emerald-600' : 'text-rose-600'">{{ pcb.cameraChecks[rowIndex - 1].judgement }}</td>
      </template>
      <template v-else-if="!pcb.cameraChecks || pcb.cameraChecks.length === 0">
        <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
      </template>
      <template v-else>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
      </template>

      <!-- Visual Check -->
      <template v-if="pcb.visualChecks && pcb.visualChecks[rowIndex - 1]">
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.visualChecks[rowIndex - 1].createdAt) }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.visualChecks[rowIndex - 1].operatorName }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold" :class="pcb.visualChecks[rowIndex - 1].judgement === 'OK' ? 'text-emerald-600' : 'text-rose-600'">{{ pcb.visualChecks[rowIndex - 1].judgement }}</td>
      </template>
      <template v-else-if="!pcb.visualChecks || pcb.visualChecks.length === 0">
        <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
      </template>
      <template v-else>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
      </template>

      <!-- Touch Up -->
      <template v-if="pcb.touchUps && pcb.touchUps[rowIndex - 1]">
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.touchUps[rowIndex - 1].createdAt) }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.touchUps[rowIndex - 1].operatorName }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold text-blue-600 dark:text-blue-400">Done</td>
      </template>
      <template v-else-if="!pcb.touchUps || pcb.touchUps.length === 0">
        <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
      </template>
      <template v-else>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
      </template>

      <!-- ROM Scan -->
      <template v-if="pcb.romScans && pcb.romScans[rowIndex - 1]">
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.romScans[rowIndex - 1].createdAt) }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.romScans[rowIndex - 1].operatorName }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold text-blue-600 dark:text-blue-400">Done</td>
      </template>
      <template v-else-if="!pcb.romScans || pcb.romScans.length === 0">
        <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
      </template>
      <template v-else>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
      </template>

      <!-- Final Inspect -->
      <template v-if="pcb.finalInspecs && pcb.finalInspecs[rowIndex - 1]">
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(pcb.finalInspecs[rowIndex - 1].createdAt) }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-700 dark:text-slate-300">{{ pcb.finalInspecs[rowIndex - 1].operatorName }}</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold text-blue-600 dark:text-blue-400">Done</td>
      </template>
      <template v-else-if="!pcb.finalInspecs || pcb.finalInspecs.length === 0">
        <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" colspan="3" class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-800/30">-</td>
      </template>
      <template v-else>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
        <td class="px-2 py-2 border border-slate-200 dark:border-slate-700 text-center text-slate-300 dark:text-slate-600">-</td>
      </template>

      <!-- Actions -->
      <td v-if="rowIndex === 1" :rowspan="getMaxRows(pcb)" class="px-4 py-2.5 text-center align-middle border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <RouterLink :to="{ name: 'Traceability', query: { id: pcb.id }}" class="inline-block bg-brand-dark/5 dark:bg-white/10 hover:bg-brand-dark dark:hover:bg-white/20 text-brand-dark dark:text-white hover:text-white px-3 py-2 rounded-lg text-[11px] font-bold transition-all">
          Details
        </RouterLink>
      </td>
    </tr>
  </template>
</template>
