<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home, SearchX } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
      <SearchX class="w-10 h-10 text-slate-400 dark:text-slate-500" />
    </div>
    <h1 class="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight">404</h1>
    <p class="text-base font-semibold text-slate-600 dark:text-slate-300 mt-2">Page Not Found</p>
    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm leading-relaxed">
      The page you're looking for doesn't exist or has been moved to a different location.
    </p>
    <button
      @click="router.push('/')"
      class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
    >
      <Home class="w-4 h-4" />
      Back to Dashboard
    </button>
  </div>
</template>
