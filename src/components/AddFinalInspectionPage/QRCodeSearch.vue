<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Search, Loader2 } from "lucide-vue-next";

const emit = defineEmits<{
  search: [value: string];
}>();

defineProps<{
  isSearching: boolean;
  searchError: string;
}>();

const qrInputRef = ref<HTMLInputElement | null>(null);
const qrSearchValue = ref("");

// Auto-focus on mount
nextTick(() => qrInputRef.value?.focus());

const handleSearch = () => {
  if (!qrSearchValue.value.trim()) return;
  emit("search", qrSearchValue.value.trim());
};

const reset = () => {
  qrSearchValue.value = "";
  nextTick(() => qrInputRef.value?.focus());
};

defineExpose({ reset, focus: () => qrInputRef.value?.focus() });
</script>

<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 lg:p-5 transition-colors"
  >
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <input
          ref="qrInputRef"
          v-model="qrSearchValue"
          type="text"
          placeholder="Scan or enter QR code..."
          class="w-full pl-4 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-colors font-mono"
          autofocus
          @keyup.enter="handleSearch"
          :disabled="isSearching"
        />
      </div>
      <button
        @click="handleSearch"
        :disabled="isSearching || !qrSearchValue.trim()"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-accent text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <Loader2 v-if="isSearching" class="w-4 h-4 animate-spin" />
        <Search v-else class="w-4 h-4" />
        {{ isSearching ? "Searching..." : "Search" }}
      </button>
    </div>

    <!-- Search Error -->
    <div
      v-if="searchError"
      class="mt-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-lg border border-rose-100 dark:border-rose-800/30"
    >
      {{ searchError }}
    </div>
  </div>
</template>
