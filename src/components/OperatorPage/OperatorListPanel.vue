<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { useOperatorsList, useCreateOperator, useUpdateOperator, useDeleteOperator } from '@/hooks/useOperators'
import { useDebounce } from '@/composables/useDebounce'
import { TriangleAlert, Pencil, Trash2, Plus, X, Users, SearchX } from 'lucide-vue-next'
import Pagination from '@/components/Pagination.vue'
import type { Operator } from '@/types/operator'
import { AxiosError } from 'axios'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const searchRef = ref('')
const debouncedSearch = useDebounce(searchRef, 500)

const params = reactive({
  page: 1,
  limit: 10,
  search: debouncedSearch.value,
  role: ''
})

watch(debouncedSearch, (newVal) => {
  params.search = newVal
  params.page = 1
})

const { data: operatorsResponse, isLoading, isError, error, refetch } = useOperatorsList(params)
const createMutation = useCreateOperator()
const updateMutation = useUpdateOperator()
const deleteMutation = useDeleteOperator()

const records = computed(() => {
  if (operatorsResponse.value?.data && Array.isArray(operatorsResponse.value.data)) {
    return operatorsResponse.value.data
  }
  if (Array.isArray(operatorsResponse.value)) {
    return operatorsResponse.value
  }
  return []
})

const setRole = (r: string) => {
  params.role = r
  params.page = 1
}

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

// Delete modal state
const showDeleteModal = ref(false)
const deletingOperator = ref<Operator | null>(null)
const deletePin = ref('')
const deletePinInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  name: '',
  pin: ''
})

const resetForm = () => {
  form.name = ''
  form.pin = ''
  isEditing.value = false
  editingId.value = null
}

const openCreate = () => {
  resetForm()
  showModal.value = true
}

const openEdit = (operator: Operator) => {
  resetForm()
  isEditing.value = true
  editingId.value = operator.id
  form.name = operator.name
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const handleSubmit = async () => {

  if (!form.name || !form.pin) {
    toast.error('Name and PIN are required.')
    return
  }

  try {
    if (isEditing.value && editingId.value !== null) {
      await updateMutation.mutateAsync({ id: editingId.value, name: form.name, pin: form.pin })
      toast.success('Operator updated successfully.')
    } else {
      await createMutation.mutateAsync({ name: form.name, pin: form.pin })
      toast.success('Operator created successfully.')
    }
    closeModal()
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      toast.error(err.response?.data?.message || err.message)
    } else if (err instanceof Error) {
      toast.error(err.message)
    } else {
      toast.error('Something went wrong.')
    }
  }
}

const openDeleteModal = (operator: Operator) => {
  deletingOperator.value = operator
  deletePin.value = ''
  showDeleteModal.value = true
  nextTick(() => deletePinInput.value?.focus())
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingOperator.value = null
  deletePin.value = ''
}

const confirmDelete = async () => {
  if (!deletingOperator.value) return
  if (!deletePin.value) {
    toast.error('PIN is required.')
    return
  }
  try {
    await deleteMutation.mutateAsync({ id: deletingOperator.value.id, pin: deletePin.value })
    closeDeleteModal()
    toast.success('Operator deleted successfully.')
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      toast.error(err.response?.data?.message || err.message)
    } else if (err instanceof Error) {
      toast.error(err.message)
    } else {
      toast.error('Failed to delete operator.')
    }
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div>
        <h3 class="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100">Operator Management</h3>
        <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400">Manage operators and their roles.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="searchRef"
          type="text"
          placeholder="Search name or username..."
          class="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
        />
        <button @click="openCreate" class="bg-brand-accent hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
          <Plus class="w-3.5 h-3.5" />
          Add Operator
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative transition-colors">
      <div class="overflow-x-auto min-h-[300px]">
        <table class="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px] lg:text-[10px]">
              <th class="px-4 py-2.5 font-black">Name</th>
              <th class="px-4 py-2.5 font-black">Assigned</th>
              <th class="px-4 py-2.5 font-black">Work Position</th>
              <th class="px-4 py-2.5 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="'skeleton-'+i" class="animate-pulse">
                <td class="px-4 py-3"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                <td class="px-4 py-3"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                <td class="px-4 py-3"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                <td class="px-4 py-3 text-right"><div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div></td>
              </tr>
            </template>
            <template v-else-if="records.length > 0">
              <tr v-for="operator in records" :key="operator.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                <td class="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-200">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-brand-accent/10 dark:bg-brand-accent/20 flex items-center justify-center shrink-0">
                      <Users class="w-3 h-3 text-brand-accent" />
                    </div>
                    {{ operator.name }}
                  </div>
                </td>
                <td class="px-4 py-2.5">
                  <div class="flex items-center gap-2">
                    <div :class="operator.assigned ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></div>
                    <span :class="operator.assigned ? 'text-green-500' : 'text-red-500'" class="font-medium">{{ operator.assigned ? 'Assigned' : 'Unassigned' }}</span>
                  </div>
                </td>
                <td class="px-4 py-2.5">
                  <div class="flex items-center gap-2">
                    {{ operator.workPosition?.join(', ') || '-' }}
                  </div>
                </td>
                <td class="px-4 py-2.5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="openEdit(operator)" class="p-1.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-brand-accent hover:text-white text-slate-500 dark:text-slate-400 rounded-lg transition-colors" title="Edit">
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button @click="openDeleteModal(operator)" class="p-1.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 rounded-lg transition-colors" title="Delete">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </template>
            <!-- Error Alert -->
            <template v-else-if="isError">
              <tr>
                <td colspan="6" class="px-4 py-16 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="bg-red-50 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-800/50">
                      <TriangleAlert class="h-8 w-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">Failed to load data</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      {{ error?.response?.data?.message || error?.message || 'An unexpected error occurred while fetching operators.' }}
                    </p>
                    <button @click="refetch()" class="mt-5 px-5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="!isLoading && !isError">
              <tr>
                <td colspan="6" class="px-4 py-16 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700/50">
                      <SearchX class="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">No operators found</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      We couldn't find any operators matching your search criteria.
                    </p>
                    <button 
                      v-if="searchRef"
                      @click="searchRef = ''; params.page = 1" 
                      class="mt-5 px-4 py-2 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Search
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-brand-dark/50 dark:bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
          <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-md overflow-hidden transition-colors">
            <!-- Header -->
            <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">
                {{ isEditing ? 'Edit Operator' : 'Add Operator' }}
              </h3>
              <button @click="closeModal" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Name <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" class="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors" placeholder="Full name" />
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">PIN <span class="text-red-500">*</span></label>
                <input v-model="form.pin" type="password" class="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors" placeholder="Enter PIN" />
              </div>
            </div>

            <!-- Footer -->
            <div class="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
              <button @click="closeModal" class="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                Cancel
              </button>
              <button @click="handleSubmit" :disabled="createMutation.isPending.value || updateMutation.isPending.value" class="px-4 py-2 bg-brand-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                <span v-if="createMutation.isPending.value || updateMutation.isPending.value">Saving...</span>
                <span v-else>{{ isEditing ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-brand-dark/50 dark:bg-black/60 backdrop-blur-sm" @click="closeDeleteModal"></div>
          <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-sm overflow-hidden transition-colors">
            <!-- Header -->
            <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Delete Operator</h3>
              <button @click="closeDeleteModal" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800/50">
                  <TriangleAlert class="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p class="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    Are you sure you want to delete <strong class="text-slate-900 dark:text-white">{{ deletingOperator?.name }}</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Enter PIN to confirm <span class="text-red-500">*</span></label>
                <input
                  ref="deletePinInput"
                  v-model="deletePin"
                  type="password"
                  class="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-colors"
                  placeholder="Enter your PIN"
                  @keyup.enter="confirmDelete"
                />
              </div>
            </div>

            <!-- Footer -->
            <div class="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
              <button @click="closeDeleteModal" class="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                Cancel
              </button>
              <button @click="confirmDelete" :disabled="deleteMutation.isPending.value" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                <span v-if="deleteMutation.isPending.value">Deleting...</span>
                <span v-else>Delete</span>
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
