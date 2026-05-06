<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md min-w-[300px] max-w-[420px]"
          :class="{
            'bg-emerald-50/95 dark:bg-emerald-900/80 border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-200': toast.type === 'success',
            'bg-red-50/95 dark:bg-red-900/80 border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-200': toast.type === 'error',
            'bg-blue-50/95 dark:bg-blue-900/80 border-blue-200 dark:border-blue-700/50 text-blue-800 dark:text-blue-200': toast.type === 'info',
            'bg-amber-50/95 dark:bg-amber-900/80 border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-200': toast.type === 'warning',
          }"
        >
          <component
            :is="iconMap[toast.type]"
            class="w-5 h-5 shrink-0"
            :class="{
              'text-emerald-500 dark:text-emerald-400': toast.type === 'success',
              'text-red-500 dark:text-red-400': toast.type === 'error',
              'text-blue-500 dark:text-blue-400': toast.type === 'info',
              'text-amber-500 dark:text-amber-400': toast.type === 'warning',
            }"
          />
          <p class="text-xs font-semibold flex-1">{{ toast.message }}</p>
          <button
            @click="removeToast(toast.id)"
            class="p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <X class="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.06, 0.71, 0.55, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
