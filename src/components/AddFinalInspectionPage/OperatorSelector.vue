<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onUnmounted } from "vue";
import { Users, X, Search, User } from "lucide-vue-next";
import { useOperatorsList, useCurrentOperators } from "@/hooks/useOperators";
import { useDebounce } from "@/composables/useDebounce";
import type { Operator } from "@/types/operator";

const emit = defineEmits<{
  "update:operatorId": [id: string | null];
}>();

const props = defineProps<{
  operatorId: string | null;
}>();

// Fetch current operators to set FinalInspect operator as default
const { data: currentOperatorsResponse } = useCurrentOperators();

const defaultFinalInspectOperator = computed(() => {
  const resp = currentOperatorsResponse.value;
  if (resp?.data?.operators && Array.isArray(resp.data.operators)) {
    const finalInspectOp = resp.data.operators.find(
      (op: any) => op.workPosition && op.workPosition.includes("FinalInspect"),
    );
    return finalInspectOp || null;
  }
  return null;
});

// Cache selected operator so it always shows even if not in current results
const selectedOperatorCache = ref<{ id: number; name: string } | null>(null);

// Set default operator on first mount (only if no operator selected yet)
const hasSetDefault = ref(false);
watch(
  defaultFinalInspectOperator,
  (op) => {
    if (op && !hasSetDefault.value && !props.operatorId) {
      hasSetDefault.value = true;
      selectedOperatorCache.value = { id: op.id, name: op.name };
      emit("update:operatorId", op.id.toString());
    }
  },
  { immediate: true },
);

// Dropdown search state — debounced for server-side search
const dropdownSearchInput = ref("");
const debouncedDropdownSearch = useDebounce(dropdownSearchInput, 400);
const params = reactive({
  limit: 10,
  page: 1,
  search: debouncedDropdownSearch.value,
});

watch(debouncedDropdownSearch, (value) => {
  params.search = value;
  params.page = 1;
});

const { data: dropdownOperatorsResponse, isLoading: isDropdownLoading } =
  useOperatorsList(params);

const dropdownOperators = computed<Operator[]>(() => {
  const resp = dropdownOperatorsResponse.value;
  if (resp?.data && Array.isArray(resp.data)) {
    return resp.data;
  }
  return [];
});

const selectedOperatorName = computed(() => {
  if (!props.operatorId) return "— Select Operator —";

  // Check cache first
  if (
    selectedOperatorCache.value &&
    selectedOperatorCache.value.id.toString() === props.operatorId
  ) {
    return selectedOperatorCache.value.name;
  }

  // Fallback to dropdown results
  const op = dropdownOperators.value.find(
    (o) => o.id.toString() === props.operatorId,
  );
  return op ? op.name : "— Select Operator —";
});

// Merge dropdown results with cached selected operator to ensure it always shows
const mergedDropdownOperators = computed(() => {
  const serverResults = dropdownOperators.value;
  const serverIds = new Set(serverResults.map((o) => o.id.toString()));

  const extraOps: Operator[] = [];
  if (
    props.operatorId &&
    selectedOperatorCache.value &&
    !serverIds.has(props.operatorId)
  ) {
    extraOps.push({
      id: selectedOperatorCache.value.id,
      name: selectedOperatorCache.value.name,
      assigned: true,
      workPosition: [],
    });
  }

  if (dropdownSearchInput.value) {
    const search = dropdownSearchInput.value.toLowerCase();
    return [
      ...extraOps.filter((op) => op.name.toLowerCase().includes(search)),
      ...serverResults,
    ];
  }

  return [...extraOps, ...serverResults];
});

// Dropdown state
const isDropdownOpen = ref(false);

const openDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) {
    dropdownSearchInput.value = "";
  }
};

const selectOperator = (op: Operator) => {
  emit("update:operatorId", op.id.toString());
  selectedOperatorCache.value = { id: op.id, name: op.name };
  isDropdownOpen.value = false;
  dropdownSearchInput.value = "";
};

const clearOperator = () => {
  emit("update:operatorId", null);
  selectedOperatorCache.value = null;
  dropdownSearchInput.value = "";
};

// Close on outside click
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest("[data-operator-dropdown]")) {
    isDropdownOpen.value = false;
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") isDropdownOpen.value = false;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 lg:p-5 transition-colors"
  >
    <h5
      class="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center text-[11px] lg:text-xs"
    >
      <User class="mr-1.5 text-brand-accent w-3.5 h-3.5" />
      Operator Selection
    </h5>

    <div class="relative" data-operator-dropdown>
      <!-- Dropdown button -->
      <button
        type="button"
        @click="openDropdown"
        class="w-full text-xs px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors flex items-center justify-between gap-2"
      >
        <span :class="!operatorId ? 'text-slate-400' : ''">{{
          selectedOperatorName
        }}</span>
        <div class="flex items-center gap-1">
          <button
            v-if="operatorId"
            @click.stop="clearOperator"
            class="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X class="w-3 h-3" />
          </button>
          <svg
            class="w-3 h-3 text-slate-400 transition-transform"
            :class="isDropdownOpen ? 'rotate-180' : ''"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <!-- Selected badge -->
      <div
        v-if="operatorId && !isDropdownOpen"
        class="mt-2 inline-flex items-center gap-1.5 bg-brand-accent/10 text-brand-accent px-2.5 py-1 rounded-lg text-xs font-bold"
      >
        <Users class="w-3 h-3" />
        {{ selectedOperatorName }}
      </div>

      <!-- Dropdown menu -->
      <Transition name="fade">
        <div
          v-if="isDropdownOpen"
          class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
        >
          <!-- Search input -->
          <div class="p-2 border-b border-slate-100 dark:border-slate-700">
            <div class="relative">
              <Search
                class="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
              />
              <input
                v-model="dropdownSearchInput"
                type="text"
                placeholder="Search operator..."
                class="w-full text-xs pl-7 pr-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
              />
            </div>
          </div>

          <!-- Options -->
          <div class="max-h-48 overflow-y-auto">
            <!-- Unassign option -->
            <button
              type="button"
              @click="clearOperator"
              class="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
            >
              <X class="w-3 h-3" />
              Unassign
            </button>

            <!-- Loading -->
            <div
              v-if="isDropdownLoading"
              class="px-3 py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5"
            >
              <svg
                class="animate-spin h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Loading...
            </div>

            <!-- Empty -->
            <div
              v-else-if="mergedDropdownOperators.length === 0"
              class="px-3 py-4 text-center text-xs text-slate-400"
            >
              No operators found.
            </div>

            <!-- Operator list -->
            <button
              v-for="op in mergedDropdownOperators.slice(0, 10)"
              :key="op.id"
              type="button"
              @click="selectOperator(op)"
              class="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
              :class="{
                'bg-brand-accent/5 dark:bg-brand-accent/10 font-semibold':
                  operatorId === op.id.toString(),
              }"
            >
              <div
                class="w-6 h-6 rounded-full bg-brand-accent/10 dark:bg-brand-accent/20 flex items-center justify-center shrink-0"
              >
                <Users class="w-3 h-3 text-brand-accent" />
              </div>
              <span>{{ op.name }}</span>
              <span
                v-if="
                  op.assigned && op.workPosition && op.workPosition.length > 0
                "
                class="ml-auto text-[9px] text-green-500 font-medium whitespace-nowrap"
                >{{ op.workPosition.join(", ") }}</span
              >
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
