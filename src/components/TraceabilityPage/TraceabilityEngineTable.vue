<script setup lang="ts">
import { SearchX, TriangleAlert } from 'lucide-vue-next'

defineProps<{
  records: any[]
  isLoading: boolean
  isError: boolean
  error: any
  searchRef: string
}>()

const emit = defineEmits<{
  'openDetails': [id: number]
  'refetch': []
  'clearSearch': []
}>()
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both transition-colors">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 text-[9px] lg:text-[10px] uppercase tracking-wider">
            <th class="px-4 py-2.5 font-bold">PCB ID</th>
            <th class="px-4 py-2.5 font-bold">Current Step</th>
            <th class="px-4 py-2.5 font-bold hidden sm:table-cell">Last Update</th>
            <th class="px-4 py-2.5 font-bold">Status</th>
            <th class="px-4 py-2.5 font-bold text-center">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50 text-[11px] lg:text-xs">
          <!-- Loading skeleton -->
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="'skeleton-'+i" class="animate-pulse">
              <td class="px-4 py-3"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
              <td class="px-4 py-3"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
              <td class="px-4 py-3 hidden sm:table-cell"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
              <td class="px-4 py-3"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-12 mx-auto"></div></td>
              <td class="px-4 py-3 text-center"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div></td>
            </tr>
          </template>

          <!-- Error Alert -->
          <template v-else-if="isError">
            <tr>
              <td colspan="5" class="px-4 py-16 text-center">
                <div class="flex flex-col items-center justify-center">
                  <div class="bg-red-50 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-800/50">
                    <TriangleAlert class="h-8 w-8 text-red-500 dark:text-red-400" />
                  </div>
                  <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">Failed to load data</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    {{ error?.response?.data?.message || error?.message || 'An unexpected error occurred while fetching PCBs.' }}
                  </p>
                  <button @click="emit('refetch')" class="mt-5 px-5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                </div>
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <template v-else-if="records.length === 0">
            <tr>
              <td colspan="5" class="px-4 py-16 text-center">
                <div class="flex flex-col items-center justify-center">
                  <div class="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700/50">
                    <SearchX class="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">No PCBs found</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    We couldn't find any data for the selected period or search criteria.
                  </p>
                  <button 
                    v-if="searchRef"
                    @click="emit('clearSearch')" 
                    class="mt-5 px-4 py-2 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Search
                  </button>
                </div>
              </td>
            </tr>
          </template>

          <!-- Data rows -->
          <template v-else>
            <tr v-for="pcb in records" :key="pcb.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors group">
              <td class="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">{{ pcb.value }}</td>
              <td class="px-4 py-2.5 text-slate-600 dark:text-slate-300">{{ pcb.lastAppearance }}</td>
              <td class="px-4 py-2.5 text-slate-400 text-[10px] hidden sm:table-cell">
                {{ new Date(pcb.createdAt).toLocaleString('en-GB') }}
              </td>
              <td class="px-4 py-2.5">
                <span :class="pcb.itemStatus === 'OK' ? 'bg-emerald-200 text-emerald-700' : pcb.itemStatus === 'NG' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'" class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-tighter">
                  {{ pcb.itemStatus }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-center">
                <button 
                  @click="emit('openDetails', pcb.id)"
                  class="bg-brand-dark/5 dark:bg-white/10 hover:bg-brand-dark dark:hover:bg-white/20 text-brand-dark dark:text-white hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                >
                  Details
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
