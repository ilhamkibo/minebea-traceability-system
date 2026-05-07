<script setup lang="ts">
import type { PcbData } from '@/types/pcb'

defineProps<{
  recentPcbs: PcbData[] | undefined
}>()
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
    <div class="flex justify-between items-center px-4 py-3 border-b border-slate-50 dark:border-slate-700/50">
      <h5 class="font-bold text-slate-800 dark:text-slate-100 text-xs lg:text-sm">Recent Scanned PCB</h5>
      <RouterLink to="/traceability" class="text-brand-accent text-[10px] lg:text-xs font-bold hover:underline">View All</RouterLink>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs whitespace-nowrap">
        <thead>
          <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] lg:text-[10px]">
            <th class="px-4 py-2 font-black">PCB ID</th>
            <th class="px-4 py-2 font-black">Last Process</th>
            <th class="px-4 py-2 font-black hidden sm:table-cell">Timestamp</th>
            <th class="px-4 py-2 font-black text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <tr
            v-for="pcb in recentPcbs"
            :key="pcb.id"
            class="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
            @click="$router.push({ name: 'Traceability', query: { id: pcb.id }})"
          >
            <td class="px-4 py-1.5 lg:py-2 font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-accent transition-colors">{{ pcb.value }}</td>
            <td class="px-4 py-1.5 lg:py-2 text-slate-600 dark:text-slate-300 font-medium text-xs">{{ pcb.lastAppearance }}</td>
            <td class="px-4 py-1.5 lg:py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell text-[10px]">{{ new Date(pcb.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) }}</td>
            <td class="px-4 py-1.5 lg:py-2 text-right">
              <span
                :class="pcb.itemStatus === 'OK' ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                class="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter"
              >
                {{ pcb.itemStatus }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
