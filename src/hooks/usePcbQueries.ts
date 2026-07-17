import { useQuery } from "@tanstack/vue-query";
import { pcbService } from "@/services/pcbService";
import { Ref, computed, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";
import { PcbParams } from "@/types/pcb";

/** Fetch 10 most recent PCBs with pagination metadata (for Dashboard Recent Activity) */
export function useRecentPcbs(refetchInterval?: number) {
  return useQuery({
    queryKey: ["recent-pcbs"],
    queryFn: () => pcbService.getPCBs({ page: 1, limit: 10, paginate: true }),
    refetchInterval: refetchInterval ?? false,
  });
}

/** Fetch PCBs without pagination — returns plain array (for stats/charts) */
export function usePcbsList(
  params: MaybeRefOrGetter<PcbParams & { paginate?: false }>,
  refetchInterval?: number,
) {
  return useQuery({
    queryKey: computed(() => ["pcbs", toValue(params)]),
    queryFn: () => pcbService.getPCBs({ ...toValue(params), paginate: false }),
    refetchInterval: refetchInterval ?? false,
  });
}

/** Fetch PCBs with pagination — returns PaginatedData { items, page, total, ... } (for tables) */
export function usePcbsListPaginated(
  params: MaybeRefOrGetter<PcbParams & { paginate?: true }>,
  refetchInterval?: number,
) {
  return useQuery({
    queryKey: computed(() => ["pcbs-paginated", toValue(params)]),
    queryFn: () => pcbService.getPCBs({ ...toValue(params), paginate: true }),
    refetchInterval: refetchInterval ?? false,
  });
}

export function usePcbDetail(id: Ref<number | undefined>) {
  return useQuery({
    queryKey: ["pcb-detail", id],
    queryFn: () => pcbService.getPCB(id.value!),
    enabled: computed(() => !!id.value),
  });
}
