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
      "ROM Scan Date",
      "ROM Scan Operator",
      "ROM Scan Result",
      "Final Inspect Date",
      "Final Inspect Operator",
      "Final Inspect Result",
    ];

    const csvRows = [headers.join(",")];

    allRecords.forEach((pcb) => {
      const maxRows = getMaxRows(pcb);
      for (let i = 0; i < maxRows; i++) {
        const row = [
          `"${i === 0 ? pcb.value : ""}"`,

          // Camera
          `"${formatDate(pcb.cameraChecks?.[i]?.createdAt)}"`,
          `"${pcb.cameraChecks?.[i]?.operatorName || ""}"`,
          `"${pcb.cameraChecks?.[i]?.judgement || ""}"`,

          // Visual
          `"${formatDate(pcb.visualChecks?.[i]?.createdAt)}"`,
          `"${pcb.visualChecks?.[i]?.operatorName || ""}"`,
          `"${pcb.visualChecks?.[i]?.judgement || ""}"`,

          // Touch Up
          `"${formatDate(pcb.touchUps?.[i]?.createdAt)}"`,
          `"${pcb.touchUps?.[i]?.operatorName || ""}"`,
          `"${pcb.touchUps?.[i] ? "Done" : ""}"`,

          // Final
          `"${formatDate(pcb.finalInspecs?.[i]?.createdAt)}"`,
          `"${pcb.finalInspecs?.[i]?.operatorName || ""}"`,
          `"${pcb.finalInspecs?.[i] ? "Done" : ""}"`,
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

    // Row 0: Main headers (first row of double header)
    const headerRow1 = [
      "QR Code",
      "Camera Check",
      "",
      "",
      "Visual Check",
      "",
      "",
      "Touch Up",
      "",
      "",
      // TODO(romscan): ROM Scan header — uncomment when RomScan service is ready
      // 'ROM Scan', '', '',
      "Final Inspect",
      "",
      "",
    ];

    // Row 1: Sub headers (second row of double header)
    const headerRow2 = [
      "",
      "Date&Time",
      "Operator Name",
      "Result",
      "Date&Time",
      "Operator Name",
      "Result",
      "Date&Time",
      "Operator Name",
      "Result",
      // TODO(romscan): ROM Scan subheaders — uncomment when RomScan service is ready
      // 'Date&Time', 'Operator Name', 'Result',
      "Date&Time",
      "Operator Name",
      "Result",
    ];

    wsData.push(headerRow1);
    wsData.push(headerRow2);

    // Initialize merges list
    const merges: XLSX.Range[] = [
      // Merge QR Code vertically (A1:A2)
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      // Merge Camera Check horizontally (B1:D1)
      { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } },
      // Merge Visual Check horizontally (E1:G1)
      { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } },
      // Merge Touch Up horizontally (H1:J1)
      { s: { r: 0, c: 7 }, e: { r: 0, c: 9 } },
      // Merge Final Inspect horizontally (K1:M1)
      { s: { r: 0, c: 10 }, e: { r: 0, c: 12 } },
    ];

    let currentRow = 2; // 0-indexed, row 0 and 1 are headers

    allRecords.forEach((pcb) => {
      const maxRows = getMaxRows(pcb);
      const startRow = currentRow;

      for (let i = 0; i < maxRows; i++) {
        const rowData = new Array(13).fill("");

        // QR Code
        rowData[0] = i === 0 ? pcb.value : "";

        // Camera
        if (pcb.cameraChecks && pcb.cameraChecks[i]) {
          rowData[1] = formatDate(pcb.cameraChecks[i].createdAt);
          rowData[2] = pcb.cameraChecks[i].operatorName || "";
          rowData[3] = pcb.cameraChecks[i].judgement || "";
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
        if (pcb.visualChecks && pcb.visualChecks[i]) {
          rowData[4] = formatDate(pcb.visualChecks[i].createdAt);
          rowData[5] = pcb.visualChecks[i].operatorName || "";
          rowData[6] = pcb.visualChecks[i].judgement || "";
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
        if (pcb.touchUps && pcb.touchUps[i]) {
          rowData[7] = formatDate(pcb.touchUps[i].createdAt);
          rowData[8] = pcb.touchUps[i].operatorName || "";
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
        if (pcb.finalInspecs && pcb.finalInspecs[i]) {
          rowData[10] = formatDate(pcb.finalInspecs[i].createdAt);
          rowData[11] = pcb.finalInspecs[i].operatorName || "";
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
      { wch: 18 },
      { wch: 20 },
      { wch: 14 }, // Camera Check
      { wch: 18 },
      { wch: 20 },
      { wch: 14 }, // Visual Check
      { wch: 18 },
      { wch: 20 },
      { wch: 12 }, // Touch Up
      { wch: 18 },
      { wch: 20 },
      { wch: 12 }, // Final Inspect
    ];

    // Styles
    const headerStyle1 = {
      font: { bold: true, color: { rgb: "334155" }, size: 10 },
      fill: { fgColor: { rgb: "E2E8F0" } }, // Slate 200
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "CBD5E1" } },
        bottom: { style: "thin", color: { rgb: "CBD5E1" } },
        left: { style: "thin", color: { rgb: "CBD5E1" } },
        right: { style: "thin", color: { rgb: "CBD5E1" } },
      },
    };

    const headerStyle2 = {
      font: { bold: true, color: { rgb: "475569" }, size: 9 },
      fill: { fgColor: { rgb: "F1F5F9" } }, // Slate 100
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "CBD5E1" } },
        bottom: { style: "thin", color: { rgb: "CBD5E1" } },
        left: { style: "thin", color: { rgb: "CBD5E1" } },
        right: { style: "thin", color: { rgb: "CBD5E1" } },
      },
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

    const totalCols = headerRow1.length;
    const totalRows = wsData.length;

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) {
          ws[cellRef] = { v: "", t: "s" };
        }

        if (r === 0) {
          ws[cellRef].s = headerStyle1;
        } else if (r === 1) {
          ws[cellRef].s = headerStyle2;
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
      @export="handleExport"
      @export-excel="handleExportExcel"
      @quick-filter="handleQuickFilter"
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
