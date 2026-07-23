<script setup lang="ts">
import { Download, FileSpreadsheet } from "lucide-vue-next";
import { getTodayDate } from "@/utils/date";

const props = defineProps<{
  params: any;
  isSingleDay: boolean;
  searchRef: string;
  recordsCount: number;
  itemStatusFilter: number | null;
}>();

const emit = defineEmits<{
  "update:params": [val: any];
  "update:isSingleDay": [val: boolean];
  "update:searchRef": [val: string];
  export: [];
  "export-excel": [];
  quickFilter: [val: string];
  toggleItemStatus: [val: number];
}>();

const handleDateChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const newParams = { ...props.params, datetime: target.value, page: 1 };
  emit("update:params", newParams);
  resetQuickFilter();
};

const handleDateToChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const newParams = { ...props.params, datetimeto: target.value, page: 1 };
  emit("update:params", newParams);
  resetQuickFilter();
};

const resetQuickFilter = () => {
  const quickFilter = document.getElementById(
    "quick-filter",
  ) as HTMLSelectElement;
  if (quickFilter) quickFilter.value = "custom";
};

const onQuickFilter = (e: Event) => {
  emit("quickFilter", (e.target as HTMLSelectElement).value);
};
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
  >
    <div>
      <h3
        class="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100"
      >
        Traceability Table
      </h3>
      <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400">
        Full process overview for each QR Code across all stations.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <!-- Export CSV -->
      <div class="relative group">
        <button
          @click="emit('export')"
          :disabled="recordsCount === 0"
          class="text-xs px-3 py-1.5 bg-brand-dark hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-1.5 transition-colors font-bold shadow-sm"
        >
          <Download class="w-3.5 h-3.5" />
          CSV
        </button>

        <div
          v-if="recordsCount === 0"
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl border border-slate-800 dark:border-slate-600"
        >
          No data available to export
          <div
            class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700"
          ></div>
        </div>
      </div>

      <!-- Export Excel -->
      <div class="relative group">
        <button
          @click="emit('export-excel')"
          :disabled="recordsCount === 0"
          class="text-xs px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-1.5 transition-colors font-bold shadow-sm"
        >
          <FileSpreadsheet class="w-3.5 h-3.5" />
          Excel
        </button>

        <div
          v-if="recordsCount === 0"
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl border border-slate-800 dark:border-slate-600"
        >
          No data available to export
          <div
            class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700"
          ></div>
        </div>
      </div>

      <input
        :value="searchRef"
        @input="
          (e) => emit('update:searchRef', (e.target as HTMLInputElement).value)
        "
        type="text"
        placeholder="Search QR Code..."
        class="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
      />

      <select
        id="quick-filter"
        @change="onQuickFilter"
        class="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors cursor-pointer"
      >
        <option value="custom" disabled hidden selected>Quick Filter</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last7days">Last 7 Days</option>
        <option value="thismonth">This Month</option>
      </select>

      <div
        class="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 shadow-sm"
      >
        <input
          :value="params.datetime"
          @change="handleDateChange"
          type="date"
          :max="getTodayDate()"
          class="text-xs px-2 py-1 bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
        />
        <span class="text-slate-300 dark:text-slate-600 font-medium text-xs"
          >to</span
        >
        <input
          :value="params.datetimeto"
          @change="handleDateToChange"
          type="date"
          :max="getTodayDate()"
          :disabled="isSingleDay"
          :class="isSingleDay ? 'opacity-50 cursor-not-allowed' : ''"
          class="text-xs px-2 py-1 bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
        />
        <label
          class="flex items-center gap-1.5 ml-2 border-l border-slate-200 dark:border-slate-700 pl-2 cursor-pointer group"
        >
          <div
            class="relative flex items-center justify-center w-3 h-3 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-brand-accent transition-colors overflow-hidden"
          >
            <input
              type="checkbox"
              :checked="isSingleDay"
              @change="
                (e) =>
                  emit(
                    'update:isSingleDay',
                    (e.target as HTMLInputElement).checked,
                  )
              "
              class="absolute opacity-0 w-full h-full cursor-pointer z-10"
            />
            <svg
              v-if="isSingleDay"
              class="w-2.5 h-2.5 text-brand-accent absolute pointer-events-none"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M3 8L6 11L11 3.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span
            class="text-[10px] text-slate-500 dark:text-slate-400 font-medium select-none group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors"
            >1 Day</span
          >
        </label>
      </div>

      <!-- Item Status Filter -->
      <div
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex overflow-hidden whitespace-nowrap text-[10px] lg:text-xs transition-colors shadow-sm"
      >
        <button
          @click="emit('toggleItemStatus', 0)"
          :class="
            itemStatusFilter === 0
              ? 'bg-emerald-100 dark:bg-emerald-900/40 font-bold text-emerald-700 dark:text-emerald-400'
              : 'bg-slate-50 dark:bg-slate-800/50 font-medium'
          "
          class="px-3 py-1.5 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          OK
        </button>
        <button
          @click="emit('toggleItemStatus', 1)"
          :class="
            itemStatusFilter === 1
              ? 'bg-amber-100 dark:bg-amber-900/40 font-bold text-amber-700 dark:text-amber-400'
              : 'bg-slate-50 dark:bg-slate-800/50 font-medium'
          "
          class="px-3 py-1.5 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
        >
          Idle
        </button>
        <button
          @click="emit('toggleItemStatus', 2)"
          :class="
            itemStatusFilter === 2
              ? 'bg-rose-100 dark:bg-rose-900/40 font-bold text-rose-700 dark:text-rose-400'
              : 'bg-slate-50 dark:bg-slate-800/50 font-medium'
          "
          class="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
        >
          Disposal
        </button>
      </div>
    </div>
  </div>
</template>
