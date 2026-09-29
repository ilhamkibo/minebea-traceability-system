<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import XLSX from "xlsx-js-style";
import { usePcbsListPaginated } from "@/hooks/usePcbQueries";
import { useDebounce } from "@/composables/useDebounce";
import { pcbService } from "@/services/pcbService";
import {
  getTodayDate,
  getYesterdayDate,
  getLast7DaysDate,
  getThisMonthStartDate,
} from "@/utils/date";
import TraceabilityTableFilters from "@/components/TraceabilityTablePage/TraceabilityTableFilters.vue";
import TraceabilityTableHeader from "@/components/TraceabilityTablePage/TraceabilityTableHeader.vue";
import TraceabilityTableRow from "@/components/TraceabilityTablePage/TraceabilityTableRow.vue";
import TraceabilityTableEmptyState from "@/components/TraceabilityTablePage/TraceabilityTableEmptyState.vue";
import Pagination from "@/components/Pagination.vue";

const searchRef = ref("");
const debouncedSearch = useDebounce(searchRef, 500);
const isSingleDay = ref(true);
const limitRef = ref(50);

const itemStatusFilter = ref<number | null>(null);

const toggleItemStatus = (status: number) => {
  if (itemStatusFilter.value === status) {
    itemStatusFilter.value = null;
  } else {
    itemStatusFilter.value = status;
  }
  params.value.page = 1;
};

const params = ref({
  page: 1,
  limit: limitRef.value,
  datetime: getTodayDate(),
  datetimeto: "",
  search: debouncedSearch.value,
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
  if (itemStatusFilter.value !== null) {
    p.itemStatus = itemStatusFilter.value;
  }
  return p;
});

const {
  data: pcbResponse,
  isLoading,
  isError,
  error,
  refetch,
} = usePcbsListPaginated(queryParams);

const records = computed(() => pcbResponse.value?.data?.items ?? []);

const paginationMeta = computed(() => {
  const d = pcbResponse.value?.data;
  if (!d || !("items" in d)) return null;
  return {
    page: d.page,
    limit: d.limit,
    totalPages: d.totalPages,
    total: d.total,
    hasPreviousPage: d.hasPreviousPage,
    hasNextPage: d.hasNextPage,
  };
});

const getMaxRows = (pcb: any) => {
  return Math.max(
    1,
    pcb.cameraChecks?.length || 0,
    pcb.visualChecks?.length || 0,
    pcb.touchUps?.length || 0,
    // TODO(romscan): ROM Writing not yet implemented — uncomment when RomScan is ready
    // pcb.romScans?.length || 0,
    pcb.finalInspecs?.length || 0,
  );
};

const dataIdx = (
  arr: unknown[] | undefined,
  maxRows: number,
  rowIndex: number,
): number => {
  if (!arr || arr.length === 0) return -1;
  const offset = maxRows - arr.length;
  if (rowIndex < offset) return -1;
  return rowIndex - offset;
};

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

const formatDate = (date: string | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const buildExportParams = () => {
  const p: any = {};
  if (params.value.search) {
    p.search = params.value.search;
  } else {
    p.datetime = params.value.datetime || getTodayDate();
    if (!isSingleDay.value && params.value.datetimeto) {
      p.datetimeto = params.value.datetimeto;
    }
  }
  return p;
};

const handleExport = async () => {
  try {
    if (records.value.length === 0) return;

    let allRecords: any[];
    try {
      const allDataRes = await pcbService.getPCBs({
        ...buildExportParams(),
        paginate: true,
        limit: 999999999,
        page: 1,
      });
      const rawData = allDataRes.data;
      allRecords = Array.isArray(rawData)
        ? rawData
        : ((rawData as any)?.items ?? []);
    } catch {
      // Fallback to currently loaded paginated records
      allRecords = records.value as unknown as any[];
    }
    if (!allRecords || allRecords.length === 0) return;

    const headers = [
      "QR Code",
      "Camera Check Date",
      "Camera Check Operator",
      "Camera Check Result",
      "Visual Check Date",
      "Visual Check Operator",
      "Visual Check Result",
      "Touch Up Date",
      "Touch Up Operator",
      "Touch Up Result",
      "Final Inspect Date",
      "Final Inspect Operator",
      "Final Inspect Result",
    ];

    const csvRows = [headers.join(",")];

    allRecords.forEach((pcb) => {
      const maxRows = getMaxRows(pcb);
      for (let i = 0; i < maxRows; i++) {
        const cIdx = dataIdx(pcb.cameraChecks, maxRows, i);
        const vIdx = dataIdx(pcb.visualChecks, maxRows, i);
        const tIdx = dataIdx(pcb.touchUps, maxRows, i);
        const fIdx = dataIdx(pcb.finalInspecs, maxRows, i);

        const c = cIdx >= 0 ? pcb.cameraChecks?.[cIdx] : null;
        const v = vIdx >= 0 ? pcb.visualChecks?.[vIdx] : null;
        const t = tIdx >= 0 ? pcb.touchUps?.[tIdx] : null;
        const f = fIdx >= 0 ? pcb.finalInspecs?.[fIdx] : null;

        const row = [
          `"${i === 0 ? pcb.value : ""}"`,

          // Camera
          `"${c ? formatDate(c.createdAt) : "-"}"`,
          `"${c ? c.operatorName || "" : "-"}"`,
          `"${c ? c.judgement || "" : "-"}"`,

          // Visual
          `"${v ? formatDate(v.createdAt) : "-"}"`,
          `"${v ? v.operatorName || "" : "-"}"`,
          `"${v ? v.judgement || "" : "-"}"`,

          // Touch Up
          `"${t ? formatDate(t.createdAt) : "-"}"`,
          `"${t ? t.operatorName || "" : "-"}"`,
          `"${t ? "Done" : "-"}"`,

          // Final
          `"${f ? formatDate(f.createdAt) : "-"}"`,
          `"${f ? f.operatorName || "" : "-"}"`,
          `"${f ? "Done" : "-"}"`,
        ];
        csvRows.push(row.join(","));
      }
    });

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `minebea_traceability_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("CSV export failed:", err);
  }
};

const handleExportExcel = async () => {
  try {
    if (records.value.length === 0) return;

    let allRecords: any[];
    try {
      const allDataRes = await pcbService.getPCBs({
        ...buildExportParams(),
        paginate: true,
        limit: 999999,
        page: 1,
      });
      const rawData = allDataRes.data;
      allRecords = Array.isArray(rawData)
        ? rawData
        : ((rawData as any)?.items ?? []);
    } catch {
      // Fallback to currently loaded paginated records
      allRecords = records.value as unknown as any[];
    }
    if (!allRecords || allRecords.length === 0) return;

    const wsData: any[][] = [];

    const headerRow = [
      "QR Code",
      "Camera Check Date",
      "Camera Check Operator",
      "Camera Check Result",
      "Visual Check Date",
      "Visual Check Operator",
      "Visual Check Result",
      "Touch Up Date",
      "Touch Up Operator",
      "Touch Up Result",
      "Final Inspect Date",
      "Final Inspect Operator",
      "Final Inspect Result",
    ];

    wsData.push(headerRow);

    // Initialize merges list (no header merges)
    const merges: XLSX.Range[] = [];

    let currentRow = 1; // 0-indexed, row 0 is header

    allRecords.forEach((pcb) => {
      const maxRows = getMaxRows(pcb);
      const startRow = currentRow;

      for (let i = 0; i < maxRows; i++) {
        const rowData = new Array(13).fill("");

        // QR Code
        rowData[0] = i === 0 ? pcb.value : "";

        // Camera
        const cIdx = dataIdx(pcb.cameraChecks, maxRows, i);
        if (cIdx >= 0 && pcb.cameraChecks?.[cIdx]) {
          rowData[1] = formatDate(pcb.cameraChecks[cIdx].createdAt);
          rowData[2] = pcb.cameraChecks[cIdx].operatorName || "";
          rowData[3] = pcb.cameraChecks[cIdx].judgement || "";
        } else if (!pcb.cameraChecks || pcb.cameraChecks.length === 0) {
          if (i === 0) {
            rowData[1] = "-";
            merges.push({
              s: { r: startRow, c: 1 },
              e: { r: startRow + maxRows - 1, c: 3 },
            });
          }
        } else {
          rowData[1] = "-";
          rowData[2] = "-";
          rowData[3] = "-";
        }

        // Visual
        const vIdx = dataIdx(pcb.visualChecks, maxRows, i);
        if (vIdx >= 0 && pcb.visualChecks?.[vIdx]) {
          rowData[4] = formatDate(pcb.visualChecks[vIdx].createdAt);
          rowData[5] = pcb.visualChecks[vIdx].operatorName || "";
          rowData[6] = pcb.visualChecks[vIdx].judgement || "";
        } else if (!pcb.visualChecks || pcb.visualChecks.length === 0) {
          if (i === 0) {
            rowData[4] = "-";
            merges.push({
              s: { r: startRow, c: 4 },
              e: { r: startRow + maxRows - 1, c: 6 },
            });
          }
        } else {
          rowData[4] = "-";
          rowData[5] = "-";
          rowData[6] = "-";
        }

        // Touch Up
        const tIdx = dataIdx(pcb.touchUps, maxRows, i);
        if (tIdx >= 0 && pcb.touchUps?.[tIdx]) {
          rowData[7] = formatDate(pcb.touchUps[tIdx].createdAt);
          rowData[8] = pcb.touchUps[tIdx].operatorName || "";
          rowData[9] = "Done";
        } else if (!pcb.touchUps || pcb.touchUps.length === 0) {
          if (i === 0) {
            rowData[7] = "-";
            merges.push({
              s: { r: startRow, c: 7 },
              e: { r: startRow + maxRows - 1, c: 9 },
            });
          }
        } else {
          rowData[7] = "-";
          rowData[8] = "-";
          rowData[9] = "-";
        }

        // Final Inspect
        const fIdx = dataIdx(pcb.finalInspecs, maxRows, i);
        if (fIdx >= 0 && pcb.finalInspecs?.[fIdx]) {
          rowData[10] = formatDate(pcb.finalInspecs[fIdx].createdAt);
          rowData[11] = pcb.finalInspecs[fIdx].operatorName || "";
          rowData[12] = "Done";
        } else if (!pcb.finalInspecs || pcb.finalInspecs.length === 0) {
          if (i === 0) {
            rowData[10] = "-";
            merges.push({
              s: { r: startRow, c: 10 },
              e: { r: startRow + maxRows - 1, c: 12 },
            });
          }
        } else {
          rowData[10] = "-";
          rowData[11] = "-";
          rowData[12] = "-";
        }

        wsData.push(rowData);
        currentRow++;
      }

      // Merge QR Code vertically if multiple rows
      if (maxRows > 1) {
        merges.push({
          s: { r: startRow, c: 0 },
          e: { r: startRow + maxRows - 1, c: 0 },
        });
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply merges
    ws["!merges"] = merges;

    // Column widths
    ws["!cols"] = [
      { wch: 28 }, // QR Code
      { wch: 20 }, // Camera Check Date
      { wch: 22 }, // Camera Check Operator
      { wch: 18 }, // Camera Check Result
      { wch: 20 }, // Visual Check Date
      { wch: 22 }, // Visual Check Operator
      { wch: 18 }, // Visual Check Result
      { wch: 20 }, // Touch Up Date
      { wch: 22 }, // Touch Up Operator
      { wch: 16 }, // Touch Up Result
      { wch: 20 }, // Final Inspect Date
      { wch: 22 }, // Final Inspect Operator
      { wch: 18 }, // Final Inspect Result
    ];

    // Header Styles
    const headerBorder = {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "thin", color: { rgb: "CBD5E1" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } },
    };

    // Header colors: QR (Ungu), Camera (Biru Tua), Visual (Pink), Touch Up (Oren), Final Inspect (Ungu Muda)
    const headerQrStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, size: 10 },
      fill: { fgColor: { rgb: "581C87" } }, // Purple 900 (Ungu)
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: headerBorder,
    };

    const headerCameraStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, size: 10 },
      fill: { fgColor: { rgb: "1E3A8A" } }, // Blue 900 (Biru Tua)
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: headerBorder,
    };

    const headerVisualStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, size: 10 },
      fill: { fgColor: { rgb: "DB2777" } }, // Pink 600 (Pink)
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: headerBorder,
    };

    const headerTouchUpStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, size: 10 },
      fill: { fgColor: { rgb: "EA580C" } }, // Orange 600 (Oren)
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: headerBorder,
    };

    const headerFinalStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, size: 10 },
      fill: { fgColor: { rgb: "A855F7" } }, // Purple 500 (Ungu Muda)
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: headerBorder,
    };

    const borderStyle = {
      top: { style: "thin", color: { rgb: "E2E8F0" } },
      bottom: { style: "thin", color: { rgb: "E2E8F0" } },
      left: { style: "thin", color: { rgb: "E2E8F0" } },
      right: { style: "thin", color: { rgb: "E2E8F0" } },
    };

    const qrCodeStyle = {
      font: { bold: true, color: { rgb: "334155" }, size: 10 },
      alignment: { horizontal: "left", vertical: "center" },
      border: borderStyle,
    };

    const okStyle = {
      font: { bold: true, color: { rgb: "059669" }, size: 10 }, // Emerald 600
      alignment: { horizontal: "center", vertical: "center" },
      border: borderStyle,
    };

    const ngStyle = {
      font: { bold: true, color: { rgb: "DC2626" }, size: 10 }, // Rose 600
      alignment: { horizontal: "center", vertical: "center" },
      border: borderStyle,
    };

    const doneStyle = {
      font: { bold: true, color: { rgb: "2563EB" }, size: 10 }, // Blue 600
      alignment: { horizontal: "center", vertical: "center" },
      border: borderStyle,
    };

    const defaultDataStyle = {
      font: { color: { rgb: "475569" }, size: 10 },
      alignment: { horizontal: "center", vertical: "center" },
      border: borderStyle,
    };

    const totalCols = headerRow.length;
    const totalRows = wsData.length;

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) {
          ws[cellRef] = { v: "", t: "s" };
        }

        if (r === 0) {
          if (c === 0) {
            ws[cellRef].s = headerQrStyle;
          } else if (c >= 1 && c <= 3) {
            ws[cellRef].s = headerCameraStyle;
          } else if (c >= 4 && c <= 6) {
            ws[cellRef].s = headerVisualStyle;
          } else if (c >= 7 && c <= 9) {
            ws[cellRef].s = headerTouchUpStyle;
          } else if (c >= 10 && c <= 12) {
            ws[cellRef].s = headerFinalStyle;
          }
        } else {
          const val = ws[cellRef].v;
          if (c === 0) {
            ws[cellRef].s = qrCodeStyle;
          } else if ((c === 3 || c === 6) && val === "OK") {
            ws[cellRef].s = okStyle;
          } else if ((c === 3 || c === 6) && val === "NG") {
            ws[cellRef].s = ngStyle;
          } else if ((c === 9 || c === 12) && val === "Done") {
            ws[cellRef].s = doneStyle;
          } else {
            ws[cellRef].s = defaultDataStyle;
          }
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Traceability");

    const filename = `minebea_traceability_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch (err) {
    console.error("Excel export failed:", err);
  }
};
</script>

<template>
  <div class="space-y-4">
    <TraceabilityTableFilters
      v-model:params="params"
      v-model:isSingleDay="isSingleDay"
      v-model:searchRef="searchRef"
      :records-count="records.length"
      :item-status-filter="itemStatusFilter"
      @export="handleExport"
      @export-excel="handleExportExcel"
      @quick-filter="handleQuickFilter"
      @toggle-item-status="toggleItemStatus"
    />

    <!-- Data Table -->
    <div
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative transition-colors"
    >
      <div
        class="overflow-x-auto min-h-75 border border-slate-200 dark:border-slate-700 rounded-lg"
      >
        <table
          class="w-full text-left text-xs whitespace-nowrap border-collapse"
        >
          <TraceabilityTableHeader />
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
            <TraceabilityTableEmptyState
              :is-loading="isLoading"
              :is-error="isError"
              :error="error"
              :records-count="records.length"
              :search-ref="searchRef"
              @refetch="refetch"
              @clear-search="
                searchRef = '';
                params.page = 1;
              "
            />

            <!-- Data rows -->
            <template v-if="!isLoading && !isError && records.length > 0">
              <TraceabilityTableRow
                v-for="pcb in records"
                :key="pcb.id"
                :pcb="pcb"
              />
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="!isLoading && records.length > 0"
      :meta="paginationMeta"
      v-model:page="params.page"
      v-model:limit="limitRef"
      :total-records="records.length"
    />
  </div>
</template>
