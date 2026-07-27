<script setup lang="ts">
import { Route as RouteIcon, Loader2 } from "lucide-vue-next";
import type { TimelineEvent } from "@/types/pcb";

defineProps<{
  timeline: TimelineEvent[] | null;
  isLoading: boolean;
}>();

const formatDate = (dateStr: string, style: "date" | "time") => {
  const d = new Date(dateStr);
  if (style === "date")
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
</script>

<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 lg:p-5 relative z-0 transition-colors"
  >
    <h5
      class="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center text-[11px] lg:text-xs"
    >
      <RouteIcon class="mr-1.5 text-brand-accent w-3.5 h-3.5" />
      Journey Log
    </h5>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <Loader2 class="w-5 h-5 text-brand-accent animate-spin" />
      <span class="ml-2 text-xs text-slate-400">Loading timeline...</span>
    </div>

    <!-- Timeline content -->
    <div
      v-else-if="timeline?.length"
      class="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700"
    >
      <div v-for="(log, idx) in timeline" :key="idx" class="relative group">
        <div
          class="absolute -left-[17.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10"
          :class="log.passed ? 'bg-emerald-500' : 'bg-rose-500'"
        ></div>

        <div
          class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
        >
          <div class="min-w-0">
            <h6
              class="font-bold text-slate-700 dark:text-slate-200 text-xs leading-tight"
            >
              {{ log.workFlowEventName }} [{{ log.operatorName }}]
            </h6>
            <div
              class="flex items-center mt-0.5 text-slate-400 dark:text-slate-500 space-x-1.5"
            >
              <span class="text-[9px] font-bold uppercase tracking-wider">
                {{ formatDate(log.createdAt, "date") }}
              </span>
              <span class="w-[3px] h-[3px] bg-slate-200 rounded-full"></span>
              <span class="text-[9px] font-bold uppercase tracking-wider">
                {{ formatDate(log.createdAt, "time") }}
              </span>
            </div>
          </div>
          <div class="flex items-center shrink-0">
            <span
              :class="
                log.passed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              "
              class="inline-flex items-center justify-center rounded-md text-[8px] px-1.5 py-0.5 font-black uppercase tracking-tighter"
            >
              {{ log.passed ? "OK" : "NG" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8 text-slate-400 dark:text-slate-500 text-xs"
    >
      No timeline data available
    </div>
  </div>
</template>
