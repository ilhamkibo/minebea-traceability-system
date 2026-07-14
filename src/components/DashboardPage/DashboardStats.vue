<script setup lang="ts">
import type { FunctionalComponent, SVGAttributes } from 'vue'

interface StatItem {
  label: string
  value: string | number
  icon: FunctionalComponent<SVGAttributes>
  color: string
}

defineProps<{
  stats: StatItem[]
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center p-3 lg:p-4 hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
    >
      <div class="flex items-center justify-between mb-2">
        <p class="text-[9px] lg:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ stat.label }}</p>
        <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50">
          <component :is="stat.icon" class="w-4 h-4 lg:w-5 lg:h-5" :class="stat.color" />
        </div>
      </div>
      <h4 class="text-lg lg:text-xl font-black text-slate-800 dark:text-slate-100 leading-none">{{ stat.value }}</h4>
    </div>
  </div>
</template>
