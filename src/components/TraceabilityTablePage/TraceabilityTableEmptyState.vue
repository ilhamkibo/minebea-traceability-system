<script setup lang="ts">
import { TriangleAlert, SearchX } from 'lucide-vue-next'

defineProps<{
  isLoading: boolean
  isError: boolean
  error: any
  recordsCount: number
  searchRef: string
}>()

const emit = defineEmits<{
  'refetch': []
  'clearSearch': []
}>()
</script>

<template>
  <!-- Loading skeleton -->
  <template v-if="isLoading">
    <tr v-for="i in 5" :key="'skeleton-'+i" class="animate-pulse">
      <td class="px-4 py-3 border border-slate-200 dark:border-slate-700"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
      <td class="px-3 py-3 border border-slate-200 dark:border-slate-700" v-for="j in 15" :key="'sk-'+j">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-14 mx-auto"></div>
      </td>
      <td class="px-4 py-3 text-center border border-slate-200 dark:border-slate-700"><div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-14 mx-auto"></div></td>
    </tr>
  </template>

  <!-- Error Alert -->
  <template v-else-if="isError">
    <tr>
      <td colspan="17" class="px-4 py-16 text-center">
        <div class="flex flex-col items-center justify-center">
          <div class="bg-red-50 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-800/50">
            <TriangleAlert class="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">Failed to load data</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {{ error?.response?.data?.message || error?.message || 'An unexpected error occurred.' }}
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
  <template v-else-if="recordsCount === 0">
    <tr>
      <td colspan="17" class="px-4 py-16 text-center">
        <div class="flex flex-col items-center justify-center">
          <div class="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700/50">
            <SearchX class="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">No records found</h4>
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
</template>
