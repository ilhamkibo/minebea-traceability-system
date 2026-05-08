<script setup lang="ts">
import { ScanLine, X, QrCode, Route as RouteIcon } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  pcbDetail: any
}>()

const emit = defineEmits<{
  'close': []
}>()
</script>

<template>
  <div v-if="isOpen && pcbDetail" class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="emit('close')"></div>
    
    <div class="relative bg-slate-50 dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 z-10 sticky top-0 shrink-0 transition-colors">
        <h3 class="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center tracking-tight">
          <ScanLine class="text-brand-accent mr-1.5 w-4 h-4" />
          Timeline Details
        </h3>
        <button @click="emit('close')" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>
      
      <div class="overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1">
        <!-- ID Card -->
        <div class="bg-brand-dark text-white shadow-md overflow-hidden relative p-4 rounded-xl flex items-center justify-between">
          <div class="absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-5 pointer-events-none">
             <QrCode class="w-20 h-20" />
          </div>
          <div class="relative z-10">
            <p class="text-[9px] text-slate-400 mb-0.5 uppercase tracking-widest font-black">Serial Number</p>
            <h4 class="text-lg lg:text-xl font-black tracking-tighter">{{ pcbDetail.value }}</h4>
          </div>
          <div class="relative z-10 text-right">
            <p class="text-[9px] text-slate-400 mb-1 uppercase tracking-widest font-black">Final Outcome</p>
            <span :class="pcbDetail.itemStatus === 'OK' ? 'bg-emerald-500' : pcbDetail.itemStatus === 'NG' ? 'bg-rose-500' : 'bg-slate-500'" class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
              {{ pcbDetail.itemStatus }}
            </span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 lg:p-5 relative z-0 transition-colors">
          <h5 class="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center text-[11px] lg:text-xs">
            <RouteIcon class="mr-1.5 text-brand-accent w-3.5 h-3.5" />
            Journey Log
          </h5>
          
          <div class="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700">
            <div v-for="(log, idx) in pcbDetail.timeLine" :key="idx" class="relative group">
              <!-- Timeline Dot -->
              <div class="absolute -left-[17.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10"
                   :class="log.passed ? 'bg-emerald-500' : 'bg-rose-500'">
              </div>
              
              <div class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                <div class="min-w-0">
                  <h6 class="font-bold text-slate-700 dark:text-slate-200 text-xs leading-tight">{{ log.workFlowEventName }} [{{ log.operatorName }}]</h6>
                  <div class="flex items-center mt-0.5 text-slate-400 dark:text-slate-500 space-x-1.5">
                     <span class="text-[9px] font-bold uppercase tracking-wider">
                       {{ new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) }}
                     </span>
                     <span class="w-[3px] h-[3px] bg-slate-200 rounded-full"></span>
                     <span class="text-[9px] font-bold uppercase tracking-wider">
                       {{ new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                     </span>
                  </div>
                </div>
                <div class="flex items-center shrink-0">
                  <span :class="log.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'" class="inline-flex items-center justify-center rounded-md text-[8px] px-1.5 py-0.5 font-black uppercase tracking-tighter">
                    {{ log.passed ? 'OK' : 'NG' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
