<script setup lang="ts">
import { ref, computed, reactive, watch } from "vue";
import {
  useCurrentOperators,
  useOperatorsList,
  useUpdateAssignments,
} from "@/hooks/useOperators";
import { useDebounce } from "@/composables/useDebounce";
import { Users, Settings2, Search, X } from "lucide-vue-next";
import type { AssignmentRow, Operator } from "@/types/operator";
import { AxiosError } from "axios";
import { useToast } from "@/composables/useToast";

const toast = useToast();

const { data: currentOperatorsResponse, isLoading: isCurrentLoading } =
  useCurrentOperators();
const assignmentMutation = useUpdateAssignments();

// Dropdown search state — debounced for server-side search
const dropdownSearchInput = ref("");
const debouncedDropdownSearch = useDebounce(dropdownSearchInput, 400);
const params = reactive({
  limit: 10,
  page: 1,
  search: debouncedDropdownSearch.value,
});

const { data: dropdownOperatorsResponse, isLoading: isDropdownLoading } =
  useOperatorsList(params);

watch(debouncedDropdownSearch, (value) => {
  params.search = value;
  params.page = 1;
});

const currentOperators = computed(() => {
  const resp = currentOperatorsResponse.value;
  if (resp?.data?.operators && Array.isArray(resp.data.operators)) {
    return resp.data.operators;
  }
  return [];
});

const dropdownOperators = computed(() => {
  const resp = dropdownOperatorsResponse.value;
  if (resp?.data && Array.isArray(resp.data)) {
    return resp.data;
  }
  return [];
});

// Store assigned operators so we can always resolve their names,
// even if they're not in the current dropdown results (limit 10)
const assignedOperatorCache = reactive<
  Map<string, { id: number; name: string }>
>(new Map());

const getOperatorAtPosition = (positionKey: string) => {
  return currentOperators.value.find((op) =>
    op.workPosition.includes(positionKey),
  );
};

// Merge dropdown results with assigned operators to ensure they always show up
const mergedDropdownOperators = computed(() => {
  const serverResults = dropdownOperators.value;
  const assignedIds = new Set(
    assignmentForm.value.map((r) => r.operatorId).filter(Boolean),
  );
  const serverIds = new Set(serverResults.map((o) => o.id.toString()));

  // Add any cached assigned operators not already in server results
  const extraOps: Operator[] = [];
  for (const id of assignedIds) {
    if (!serverIds.has(id)) {
      const cached = assignedOperatorCache.get(id);
      if (cached) {
        extraOps.push({
          id: cached.id,
          name: cached.name,
          assigned: true,
          workPosition: [],
        });
      }
    }
  }

  // If there's a search query, filter extra ops too
  if (dropdownSearchInput.value) {
    const search = dropdownSearchInput.value.toLowerCase();
    return [
      ...extraOps.filter((op) => op.name.toLowerCase().includes(search)),
      ...serverResults,
    ];
  }

  return [...extraOps, ...serverResults];
});

// Assignment modal state
const showAssignmentModal = ref(false);
const assignmentPin = ref("");
const assignmentError = ref("");

const assignmentForm = ref<AssignmentRow[]>([
  { label: "Camera Check", assignPosition: 0, operatorId: "" },
  { label: "Visual Check", assignPosition: 1, operatorId: "" },
  { label: "Touch Up", assignPosition: 2, operatorId: "" },
  // TODO(romscan): RomScan not yet implemented — uncomment when RomScan service is ready
  // { label: 'Romscan', assignPosition: 3, operatorId: '' },
  { label: "Final Inspect", assignPosition: 4, operatorId: "" },
]);

const openAssignmentModal = () => {
  const ops = currentOperators.value;
  const form = assignmentForm.value;

  // Populate the assigned operator cache from current operators
  assignedOperatorCache.clear();
  for (const op of ops) {
    assignedOperatorCache.set(op.id.toString(), { id: op.id, name: op.name });
  }

  form[0].operatorId =
    ops.find((o) => o.workPosition.includes("CameraCheck"))?.id.toString() ||
    "";
  form[1].operatorId =
    ops.find((o) => o.workPosition.includes("VisualCheck"))?.id.toString() ||
    "";
  form[2].operatorId =
    ops.find((o) => o.workPosition.includes("TouchUp"))?.id.toString() || "";
  // TODO(romscan): RomScan assignment not yet implemented — uncomment when RomScan is ready
  // form[3].operatorId = ops.find(o => o.workPosition.includes('RomScan'))?.id.toString() || ''
  form[3].operatorId =
    ops.find((o) => o.workPosition.includes("FinalInspect"))?.id.toString() ||
    "";

  assignmentPin.value = "";
  assignmentError.value = "";
  dropdownSearchInput.value = "";
  showAssignmentModal.value = true;
};

const closeAssignmentModal = () => {
  showAssignmentModal.value = false;
  assignmentPin.value = "";
  assignmentError.value = "";
  dropdownSearchInput.value = "";
};

const handleAssignmentSubmit = async () => {
  assignmentError.value = "";

  if (!assignmentPin.value) {
    assignmentError.value = "PIN is required.";
    toast.error("PIN is required.");
    return;
  }

  type PayloadItem = {
    id: string;
    workPosition: number[];
  };

  const payload = Object.values(
    assignmentForm.value.reduce<Record<string, PayloadItem>>((acc, row) => {
      const id = row.operatorId || "";

      if (!acc[id]) {
        acc[id] = {
          id,
          workPosition: [],
        };
      }

      acc[id].workPosition.push(row.assignPosition);

      return acc;
    }, {}),
  );

  try {
    await assignmentMutation.mutateAsync({
      data: payload,
      pin: assignmentPin.value,
    });
    toast.success("Assignment updated successfully.");
    closeAssignmentModal();
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      assignmentError.value = err.response?.data?.message || err.message;
      toast.error(err.response?.data?.message || err.message);
    } else if (err instanceof Error) {
      assignmentError.value = err.message;
      toast.error(err.message);
    } else {
      assignmentError.value = "Something went wrong.";
      toast.error("Something went wrong.");
    }
  }
};

// Searchable dropdown state
const activeDropdownIndex = ref<number | null>(null);

const openDropdown = (index: number) => {
  if (activeDropdownIndex.value === index) {
    activeDropdownIndex.value = null;
    return;
  }
  activeDropdownIndex.value = index;
  dropdownSearchInput.value = "";
};

const selectOperator = (index: number, operator: Operator) => {
  assignmentForm.value[index].operatorId = operator.id.toString();
  // Cache the selected operator
  assignedOperatorCache.set(operator.id.toString(), {
    id: operator.id,
    name: operator.name,
  });
  activeDropdownIndex.value = null;
  dropdownSearchInput.value = "";
};

const clearOperator = (index: number) => {
  assignmentForm.value[index].operatorId = "";
};

const selectedOperatorName = (index: number) => {
  const id = assignmentForm.value[index].operatorId;
  if (!id) return "— Select Operator —";

  // First check cached assigned operators
  const cached = assignedOperatorCache.get(id);
  if (cached) return cached.name;

  // Fallback to dropdown results
  const op = dropdownOperators.value.find((o) => o.id.toString() === id);
  return op ? op.name : "— Select Operator —";
};
</script>

<template>
  <div>
    <div
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors"
    >
      <div
        class="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between"
      >
        <h4
          class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
        >
          <Users class="w-4 h-4 text-brand-accent" />
          Current Working Operators
        </h4>
        <div class="flex items-center gap-3">
          <div
            v-if="isCurrentLoading"
            class="flex items-center gap-1.5 text-[10px] text-slate-400"
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
          <button
            @click="openAssignmentModal"
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Settings2 class="w-3.5 h-3.5" />
            Assign Operators
          </button>
        </div>
      </div>
      <!-- <div class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"> -->
      <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="position in [
            { key: 'CameraCheck', label: 'Camera Check' },
            { key: 'VisualCheck', label: 'Visual Check' },
            { key: 'TouchUp', label: 'Touch Up' },
            // TODO(romscan): RomScan station not yet implemented — uncomment when RomScan is ready
            // { key: 'RomScan', label: 'Romscan' },
            { key: 'FinalInspect', label: 'Final Inspect' },
          ]"
          :key="position.key"
          class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50"
        >
          <div
            class="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5"
          >
            {{ position.label }}
          </div>
          <template v-if="isCurrentLoading">
            <div
              class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"
            ></div>
          </template>
          <template v-else>
            <div
              v-if="getOperatorAtPosition(position.key)"
              class="flex items-center gap-2"
            >
              <div
                class="w-7 h-7 rounded-full bg-brand-accent/10 dark:bg-brand-accent/20 flex items-center justify-center shrink-0"
              >
                <Users class="w-3.5 h-3.5 text-brand-accent" />
              </div>
              <div>
                <div
                  class="text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  {{ getOperatorAtPosition(position.key)?.name }}
                </div>
                <div class="text-[9px] text-green-500 font-medium">
                  ● Active
                </div>
              </div>
            </div>
            <div v-else class="flex items-center gap-2">
              <div
                class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0"
              >
                <X class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              </div>
              <div
                class="text-[10px] text-slate-400 dark:text-slate-500 font-medium"
              >
                Unassigned
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Assignment Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showAssignmentModal"
          class="fixed inset-0 z-100 flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-brand-dark/50 dark:bg-black/60 backdrop-blur-sm"
            @click="closeAssignmentModal"
          ></div>
          <div
            class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-lg overflow-hidden transition-colors"
          >
            <!-- Header -->
            <div
              class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between"
            >
              <h3
                class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"
              >
                <Settings2 class="w-4 h-4 text-brand-accent" />
                Assign Operators to Stations
              </h3>
              <button
                @click="closeAssignmentModal"
                class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div
                v-for="(row, index) in assignmentForm"
                :key="index"
                class="pb-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
              >
                <label
                  class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2"
                >
                  {{ row.label }}
                </label>

                <div class="relative">
                  <!-- Dropdown button -->
                  <button
                    type="button"
                    @click="openDropdown(index)"
                    class="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors flex items-center justify-between gap-2"
                  >
                    <span :class="!row.operatorId ? 'text-slate-400' : ''">{{
                      selectedOperatorName(index)
                    }}</span>
                    <svg
                      class="w-3 h-3 text-slate-400 transition-transform"
                      :class="activeDropdownIndex === index ? 'rotate-180' : ''"
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
                  </button>

                  <!-- Dropdown menu -->
                  <Transition name="fade">
                    <div
                      v-if="activeDropdownIndex === index"
                      class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                    >
                      <div
                        class="p-2 border-b border-slate-100 dark:border-slate-700"
                      >
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
                      <div class="max-h-48 overflow-y-auto">
                        <button
                          type="button"
                          @click="clearOperator(index)"
                          class="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                        >
                          <X class="w-3 h-3" />
                          Unassign
                        </button>
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
                        <div
                          v-else-if="mergedDropdownOperators.length === 0"
                          class="px-3 py-4 text-center text-xs text-slate-400"
                        >
                          No operators found.
                        </div>
                        <button
                          v-for="(op, opIndex) in mergedDropdownOperators.slice(
                            0,
                            10,
                          )"
                          :key="op.id"
                          type="button"
                          @click="selectOperator(index, op)"
                          class="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                          :class="{
                            'bg-brand-accent/5 dark:bg-brand-accent/10 font-semibold':
                              row.operatorId === op.id.toString(),
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
                              op.assigned &&
                              op.workPosition &&
                              op.workPosition.length > 0
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

              <!-- PIN Input -->
              <div class="pt-2">
                <label
                  class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
                  >PIN <span class="text-red-500">*</span></label
                >
                <input
                  v-model="assignmentPin"
                  type="password"
                  class="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
                  placeholder="Enter PIN to confirm assignment"
                  @keyup.enter="handleAssignmentSubmit"
                />
              </div>
            </div>

            <!-- Footer -->
            <div
              class="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2"
            >
              <button
                @click="closeAssignmentModal"
                class="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="handleAssignmentSubmit"
                :disabled="assignmentMutation.isPending.value"
                class="px-4 py-2 bg-brand-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span v-if="assignmentMutation.isPending.value">Saving...</span>
                <span v-else>Save Assignment</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
