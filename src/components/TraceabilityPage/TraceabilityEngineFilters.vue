<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { getTodayDate } from '@/utils/date'

const props = defineProps<{
  params: any
  isSingleDay: boolean
  searchRef: string
}>()

const emit = defineEmits<{
  'update:params': [val: any]
  'update:isSingleDay': [val: boolean]
  'update:searchRef': [val: string]
  'quickFilter': [val: string]
}>()

const handleDateChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const newParams = { ...props.params, datetime: target.value, page: 1 }
  emit('update:params', newParams)
  resetQuickFilter()
}

const handleDateToChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const newParams = { ...props.params, datetimeto: target.value, page: 1 }
  emit('update:params', newParams)
  resetQuickFilter()
}

const resetQuickFilter = () => {
  const quickFilter = document.getElementById('quick-filter-2') as HTMLSelectElement
  if (quickFilter) quickFilter.value = 'custom'
}

const onQuickFilter = (e: Event) => {
  emit('quickFilter', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="flex flex-wrap gap-4 items-center justify-center">
    <!-- Search / Filter -->
    <div class="relative w-full group max-w-md px-2 lg:px-0">
      <input 
        :value="searchRef"
        @input="e => emit('update:searchRef', (e.target as HTMLInputElement).value)"
        type="text" 
        placeholder="Filter by PCB ID, Status, or Step..."
        class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pl-9 outline-none focus:border-brand-accent transition-all shadow-sm text-xs lg:text-sm text-slate-800 dark:text-slate-200"
      />
      <Search class="absolute left-4 lg:left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
    </div>
    <!-- Filter date -->
    <div class="flex items-center gap-2">
      <select 
        id="quick-filter-2"
        @change="onQuickFilter"
        class="w-full sm:w-auto text-xs lg:text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl focus:outline-none focus:border-brand-accent transition-colors cursor-pointer shadow-sm"
      >
        <option value="custom" disabled hidden selected>Quick Filter</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last7days">Last 7 Days</option>
        <option value="thismonth">This Month</option>
      </select>

      <div class="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 shadow-sm">
        <input 
          :value="params.datetime"
          @change="handleDateChange"
          type="date" 
          :max="getTodayDate()"
          class="text-xs lg:text-sm px-1 py-1 bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
        />
        <span class="text-slate-300 dark:text-slate-600 font-medium text-xs">to</span>
        <input 
          :value="params.datetimeto"
          @change="handleDateToChange"
          type="date" 
          :max="getTodayDate()"
          :disabled="isSingleDay"
          :class="isSingleDay ? 'opacity-50 cursor-not-allowed' : ''"
          class="text-xs lg:text-sm px-1 py-1 bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
        />
        <label class="flex items-center gap-1.5 ml-1 border-l border-slate-200 dark:border-slate-700 pl-3 cursor-pointer group">
          <div class="relative flex items-center justify-center w-3.5 h-3.5 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-brand-accent transition-colors overflow-hidden">
            <input type="checkbox" :checked="isSingleDay" @change="e => emit('update:isSingleDay', (e.target as HTMLInputElement).checked)" class="absolute opacity-0 w-full h-full cursor-pointer z-10" />
            <svg v-if="isSingleDay" class="w-2.5 h-2.5 text-brand-accent absolute pointer-events-none" viewBox="0 0 14 14" fill="none">
              <path d="M3 8L6 11L11 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 font-medium select-none group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">1 Day</span>
        </label>
      </div>
    </div>
  </div>
</template>
