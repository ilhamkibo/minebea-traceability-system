<script setup lang="ts">
  const props = defineProps<{
    daterange: number
  }>()

  const emit = defineEmits<{
    'update:daterange': [value: number]
  }>()
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
    <div>
      <h3 class="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Production Overview</h3>
      <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400">Traceability summary for Minebea plant.</p>
    </div>
    <div class="flex items-center space-x-2">
      <select
        :value="daterange"
        @change="emit('update:daterange', Number(($event.target as HTMLSelectElement).value))"
        class="flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 text-[10px] lg:text-xs outline-none focus:border-brand-accent transition-colors"
      >
        <option value="0">Last 7 Days</option>
        <option value="1">Last 30 Days</option>
      </select>
    </div>
  </div>
</template>
