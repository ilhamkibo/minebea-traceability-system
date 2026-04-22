<script setup lang="ts">
import { computed } from 'vue'
import type { PaginationMeta } from '@/types/pagination'

const props = defineProps<{
  meta: PaginationMeta | null
  limit?: number
  page?: number
  totalRecords?: number
}>()

const emit = defineEmits<{
  (e: 'update:limit', value: number): void
  (e: 'update:page', value: number): void
}>()

const currentLimit = computed({
  get: () => props.meta?.limit || props.limit || 10,
  set: (val: number) => emit('update:limit', val)
})

const currentPage = computed({
  get: () => props.meta?.page || props.page || 1,
  set: (val: number) => emit('update:page', val)
})

const isPrevDisabled = computed(() => {
  return props.meta ? !props.meta.hasPreviousPage : currentPage.value <= 1
})

const isNextDisabled = computed(() => {
  return props.meta ? !props.meta.hasNextPage : (props.totalRecords !== undefined ? props.totalRecords < currentLimit.value : false)
})

const startResult = computed(() => {
  if (!props.meta) return 0
  return Math.min((props.meta.page - 1) * props.meta.limit + 1, props.meta.total)
})

const endResult = computed(() => {
  if (!props.meta) return 0
  return Math.min(props.meta.page * props.meta.limit, props.meta.total)
})
</script>

<template>
  <div class="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
    <span class="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <select 
        v-model.number="currentLimit" 
        class="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors cursor-pointer"
      >
        <option :value="10">10 / page</option>
        <option :value="20">20 / page</option>
        <option :value="50">50 / page</option>
        <option :value="100">100 / page</option>
      </select>
      
      <template v-if="meta">
        <span class="ml-1">
          Showing <span class="font-medium text-slate-700 dark:text-slate-200">{{ startResult }}</span> 
          to <span class="font-medium text-slate-700 dark:text-slate-200">{{ endResult }}</span> 
          of <span class="font-medium text-slate-700 dark:text-slate-200">{{ meta.total }}</span> results
        </span>
      </template>
      <template v-else>
        <span class="ml-1">Page {{ currentPage }}</span>
      </template>
    </span>

    <div class="flex space-x-1 shrink-0">
      <button 
        @click="currentPage--" 
        :disabled="isPrevDisabled"
        class="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        Prev
      </button>
      <button 
        @click="currentPage++" 
        :disabled="isNextDisabled"
        class="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        Next
      </button>
    </div>
  </div>
</template>
