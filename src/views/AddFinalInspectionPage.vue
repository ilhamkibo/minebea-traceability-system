<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Check, Loader2 } from "lucide-vue-next";
import { pcbService } from "@/services/pcbService";
import { useCreateFinalInspection } from "@/hooks/useFinalInspection";
import { useToast } from "@/composables/useToast";
import { isAuthenticated, clearAuthToken } from "@/lib/api";
import { authService } from "@/services/authService";
import QRCodeSearch from "@/components/AddFinalInspectionPage/QRCodeSearch.vue";
import PCBInfoCard from "@/components/AddFinalInspectionPage/PCBInfoCard.vue";
import OperatorSelector from "@/components/AddFinalInspectionPage/OperatorSelector.vue";
import AdminLoginForm from "@/components/AddFinalInspectionPage/AdminLoginForm.vue";
import type { PcbDetail, PcbData } from "@/types/pcb";
import type { ApiResponse } from "@/types/api-response";

const toast = useToast();

// Auth state
const isLoggedIn = ref(isAuthenticated());
const isLoggingIn = ref(false);
const loginError = ref("");
const loginFormRef = ref<InstanceType<typeof AdminLoginForm> | null>(null);

// QR Code search state
const isSearching = ref(false);
const searchError = ref("");
const qrSearchRef = ref<InstanceType<typeof QRCodeSearch> | null>(null);

// PCB data
const pcbData = ref<PcbData | null>(null);
const pcbDetail = ref<PcbDetail | null>(null);
const isLoadingTimeline = ref(false);

// Operator selection
const selectedOperatorId = ref<string | null>(null);

// Submit mutation
const { mutateAsync: createFinalInspection, isPending: isSubmitting } =
  useCreateFinalInspection();

// Login handler
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  const { username, password } = loginFormRef.value;
  if (!username.trim() || !password.trim()) return;

  isLoggingIn.value = true;
  loginError.value = "";

  try {
    await authService.login(username.trim(), password);
    isLoggedIn.value = true;
    toast.success("Login successful!");
  } catch (err: any) {
    loginError.value =
      err?.response?.data?.message || "Login failed. Check your credentials.";
  } finally {
    isLoggingIn.value = false;
  }
};

// Search for QR code
const handleSearch = async (value: string) => {
  isSearching.value = true;
  searchError.value = "";
  pcbData.value = null;
  pcbDetail.value = null;
  selectedOperatorId.value = null;

  try {
    const result: ApiResponse<PcbData[]> = await pcbService.getPCBs({
      search: value,
      paginate: false,
      limit: 1,
      page: 1,
    });

    const items = Array.isArray(result.data) ? result.data : [];

    if (items.length === 0) {
      searchError.value = "No QR code found matching your search.";
      return;
    }

    pcbData.value = items[0];

    // Fetch detail with timeline
    if (pcbData.value?.id) {
      isLoadingTimeline.value = true;
      try {
        const detail = await pcbService.getPCB(pcbData.value.id);
        pcbDetail.value = detail;
      } catch (err) {
        console.error("Failed to load PCB detail:", err);
      } finally {
        isLoadingTimeline.value = false;
      }
    }
  } catch (err: any) {
    searchError.value =
      err?.response?.data?.message || "Failed to search QR code.";
    console.error("QR search failed:", err);
  } finally {
    isSearching.value = false;
  }
};

// Submit final inspection
const handleSubmit = async () => {
  if (!pcbData.value || !selectedOperatorId.value) {
    toast.warning("Please scan a QR code and select an operator.");
    return;
  }
  console.log("Submitting final inspection:", {
    qrCode: pcbData.value.value,
    operatorId: selectedOperatorId.value,
  });

  try {
    await createFinalInspection({
      qrCode: pcbData.value.value,
      operatorId: selectedOperatorId.value,
    });

    toast.success("Final inspection created successfully!");

    // Clear token after successful submit (one-time use per login)
    // clearAuthToken();
    // isLoggedIn.value = false;

    // Reset and refocus QR input
    pcbData.value = null;
    pcbDetail.value = null;
    selectedOperatorId.value = null;
    await nextTick();
    qrSearchRef.value?.reset();
  } catch (err: any) {
    const msg =
      err?.response?.data?.message || "Failed to create final inspection.";
    toast.error(msg);
    console.error("Submit failed:", err);
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-4 pb-8">
    <!-- Header -->
    <div class="text-center space-y-1 mb-4">
      <h3
        class="text-lg lg:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight"
      >
        Add Final Inspection
      </h3>
      <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 px-4">
        Scan a QR code to create a new final inspection record
      </p>
    </div>

    <!-- Login Gate -->
    <AdminLoginForm
      v-if="!isLoggedIn"
      ref="loginFormRef"
      :is-logging-in="isLoggingIn"
      :login-error="loginError"
      @login-success="handleLogin"
    />

    <!-- Content (only visible when logged in) -->
    <form v-if="isLoggedIn" @submit.prevent="handleSubmit" class="space-y-4">
      <!-- QR Code Input -->
      <QRCodeSearch
        ref="qrSearchRef"
        :is-searching="isSearching"
        :search-error="searchError"
        @search="handleSearch"
      />

      <!-- PCB Info + Timeline (shown after scan) -->
      <PCBInfoCard
        v-if="pcbData"
        :pcb-data="pcbData"
        :pcb-detail="pcbDetail"
        :is-loading-timeline="isLoadingTimeline"
      />

      <!-- Operator Selection (shown after scan) -->
      <OperatorSelector
        v-if="pcbData"
        :operator-id="selectedOperatorId"
        @update:operator-id="selectedOperatorId = $event"
      />

      <!-- Submit Button (shown after scan) -->
      <div v-if="pcbData">
        <button
          type="submit"
          :disabled="isSubmitting || !selectedOperatorId"
          class="cursor-pointer bg-green-500 gap-2 px-5 py-3 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <Check v-else class="w-4 h-4" />
          {{ isSubmitting ? "Submitting..." : "Submit OK" }}
        </button>
      </div>
    </form>
  </div>
</template>
