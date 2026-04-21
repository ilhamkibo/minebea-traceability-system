<script setup lang="ts">
    import { usePcbData } from '../composables/usePcbData'
    const { pcbRecords } = usePcbData()
</script>

<template>
    <div class="space-y-4">
        <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100">Traceability Table</h1>
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex items-center justify-center min-h-[300px] transition-colors">
           <p class="text-slate-400 dark:text-slate-500 font-medium tracking-tight">Data table preview coming soon...</p>
        </div>
    </div>
</template>