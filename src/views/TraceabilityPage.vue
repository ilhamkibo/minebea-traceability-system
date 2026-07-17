<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePcbsListPaginated, usePcbDetail } from "@/hooks/usePcbQueries";
import { useDebounce } from "@/composables/useDebounce";
import Pagination from "@/components/Pagination.vue";
import {
  getTodayDate,
  getYesterdayDate,
  getLast7DaysDate,
  getThisMonthStartDate,
} from "@/utils/date";
import TraceabilityEngineFilters from "@/components/TraceabilityPage/TraceabilityEngineFilters.vue";
import TraceabilityEngineTable from "@/components/TraceabilityPage/TraceabilityEngineTable.vue";
import TraceabilityTimelineModal from "@/components/TraceabilityPage/TraceabilityTimelineModal.vue";

const route = useRoute();
const router = useRouter();

// Table and Pagination state
const searchRef = ref("");
const debouncedSearch = useDebounce(searchRef, 500);
const limitRef = ref(50);
const isSingleDay = ref(true);

const params = ref({
  page: 1,
  limit: limitRef.value,
  datetime: getTodayDate(),
  datetimeto: "",
  search: debouncedSearch.value,
  paginate: true,
});

watch(isSingleDay, (val) => {
  if (val) {
    params.value.datetimeto = "";
  } else {
    if (!params.value.datetimeto) params.value.datetimeto = getTodayDate();
  }
  params.value.page = 1;
});

watch(debouncedSearch, (newVal) => {
  params.value.search = newVal;
  params.value.page = 1;
});

watch(limitRef, (newVal) => {
  params.value.limit = newVal;
  params.value.page = 1;
});

const queryParams = computed(() => {
  const p: any = {
    page: params.value.page,
    limit: params.value.limit,
  };
  if (params.value.search) {
    p.search = params.value.search;
  } else {
    p.datetime = params.value.datetime || getTodayDate();
    if (!isSingleDay.value && params.value.datetimeto) {
      p.datetimeto = params.value.datetimeto;
    }
  }
  return p;
});

const {
  data: pcbResponse,
  isLoading: isLoadingPcbs,
  isError,
  error,
  refetch,
} = usePcbsListPaginated(queryParams);

const records = computed(() => pcbResponse.value?.data?.items ?? []);

const paginationMeta = computed(() => {
  const d = pcbResponse.value?.data;
  if (!d || !('items' in d)) return null;
  return {
    page: d.page,
    limit: d.limit,
    totalPages: d.totalPages,
    total: d.total,
    hasPreviousPage: d.hasPreviousPage,
    hasNextPage: d.hasNextPage,
  };
});

// Modal state
const isModalOpen = ref(false);
const selectedPcbId = ref<number | undefined>(undefined);

const { data: selectedPcbDetail } = usePcbDetail(selectedPcbId);

const openDetails = (id: number) => {
  selectedPcbId.value = id;
  isModalOpen.value = true;
  router.replace({ query: { id: id.toString() } });
};

const closeModal = () => {
  isModalOpen.value = false;
  router.replace({ query: {} });
};

onMounted(() => {
  if (route.query.id) {
    const id = parseInt(route.query.id as string);
    if (!isNaN(id)) {
      openDetails(id);
    }
  }
});

watch(
  () => route.query.id,
  (newId) => {
    if (newId) {
      const id = parseInt(newId as string);
      if (!isNaN(id) && selectedPcbId.value !== id) {
        openDetails(id);
      }
    } else {
      isModalOpen.value = false;
    }
  },
);

const handleQuickFilter = (val: string) => {
  switch (val) {
    case "today":
      isSingleDay.value = true;
      params.value.datetime = getTodayDate();
      break;
    case "yesterday":
      isSingleDay.value = true;
      params.value.datetime = getYesterdayDate();
      break;
    case "last7days":
      isSingleDay.value = false;
      params.value.datetime = getLast7DaysDate();
      params.value.datetimeto = getTodayDate();
      break;
    case "thismonth":
      isSingleDay.value = false;
      params.value.datetime = getThisMonthStartDate();
      params.value.datetimeto = getTodayDate();
      break;
  }
  params.value.page = 1;
};
</script>

<template>
  <div class="mx-auto space-y-4 pb-8">
    <div class="text-center space-y-1 mb-4">
      <h3
        class="text-lg lg:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight"
      >
        Traceability Engine
      </h3>
      <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 px-4">
        Track every touchpoint of your PCB production line
      </p>
    </div>

    <TraceabilityEngineFilters
      v-model:params="params"
      v-model:isSingleDay="isSingleDay"
      v-model:searchRef="searchRef"
      @quick-filter="handleQuickFilter"
    />

    <TraceabilityEngineTable
      :records="records"
      :is-loading="isLoadingPcbs"
      :is-error="isError"
      :error="error"
      :search-ref="searchRef"
      @open-details="openDetails"
      @refetch="refetch"
      @clear-search="
        searchRef = '';
        params.page = 1;
      "
    />

    <!-- Pagination -->
    <Pagination
      v-if="!isLoadingPcbs && records.length > 0"
      :meta="paginationMeta"
      v-model:page="params.page"
      v-model:limit="limitRef"
      :total-records="records.length"
    />

    <!-- Modal for PCB Details -->
    <TraceabilityTimelineModal
      :is-open="isModalOpen"
      :pcb-detail="selectedPcbDetail"
      @close="closeModal"
    />
  </div>
</template>
