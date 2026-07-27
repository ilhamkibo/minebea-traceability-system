<script setup lang="ts">
import { QrCode } from "lucide-vue-next";
import type { PcbData, PcbDetail } from "@/types/pcb";
import JourneyLog from "./JourneyLog.vue";

defineProps<{
  pcbData: PcbData;
  pcbDetail: PcbDetail | null;
  isLoadingTimeline: boolean;
}>();
</script>

<template>
  <div class="space-y-4">
    <!-- PCB ID Card -->
    <div
      class="bg-brand-dark text-white shadow-md overflow-hidden relative p-4 rounded-xl flex items-center justify-between"
    >
      <div
        class="absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-5 pointer-events-none"
      >
        <QrCode class="w-20 h-20" />
      </div>
      <div class="relative z-10">
        <p
          class="text-[9px] text-slate-400 mb-0.5 uppercase tracking-widest font-black"
        >
          Serial Number
        </p>
        <h4 class="text-lg lg:text-xl font-black tracking-tighter">
          {{ pcbData.value }}
        </h4>
      </div>
      <div class="relative z-10 text-right">
        <p
          class="text-[9px] text-slate-400 mb-1 uppercase tracking-widest font-black"
        >
          Status
        </p>
        <span
          :class="
            pcbData.itemStatus === 'OK'
              ? 'bg-emerald-500'
              : pcbData.itemStatus === 'NG'
                ? 'bg-rose-500'
                : 'bg-slate-500'
          "
          class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm"
        >
          {{ pcbData.itemStatus }}
        </span>
      </div>
    </div>

    <!-- QR Code Details Grid -->
    <div
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 lg:p-5 transition-colors"
    >
      <h5
        class="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center text-[11px] lg:text-xs"
      >
        <QrCode class="mr-1.5 text-brand-accent w-3.5 h-3.5" />
        PCB Details
      </h5>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700"
        >
          <p
            class="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-0.5"
          >
            QR Code
          </p>
          <p
            class="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono truncate"
          >
            {{ pcbData.value }}
          </p>
        </div>
        <div
          class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700"
        >
          <p
            class="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-0.5"
          >
            Last Appearance
          </p>
          <p class="text-xs font-bold text-slate-700 dark:text-slate-200">
            {{ pcbData.lastAppearance }}
          </p>
        </div>
        <div
          class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700"
        >
          <p
            class="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-0.5"
          >
            Created
          </p>
          <p class="text-xs font-bold text-slate-700 dark:text-slate-200">
            {{
              pcbData.createdAt
                ? new Date(pcbData.createdAt).toLocaleString()
                : "-"
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <JourneyLog
      :timeline="pcbDetail?.timeLine ?? null"
      :is-loading="isLoadingTimeline"
    />
  </div>
</template>
