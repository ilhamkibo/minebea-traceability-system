import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { AxiosError } from "axios";
import type {
  FinalInspection,
  FinalInspectionParams,
} from "@/types/final-inspection";
import type { ApiError, ApiResponse } from "@/types/api-response";
import { finalInspectionService } from "@/services/finalInspectionService";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export function useFinalInspections(
  params: MaybeRefOrGetter<FinalInspectionParams>,
) {
  return useQuery<ApiResponse<FinalInspection[]>, AxiosError<ApiError>>({
    queryKey: computed(() => ["final-inspections", toValue(params)]),
    queryFn: () => finalInspectionService.getFinalInspections(toValue(params)),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });
}

export function useManualFinalInspections(params: MaybeRefOrGetter<any>) {
  return useQuery<ApiResponse<FinalInspection[]>, AxiosError<ApiError>>({
    queryKey: computed(() => ["manual-final-inspections", toValue(params)]),
    queryFn: () =>
      finalInspectionService.getManualFinalInspections(toValue(params)),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });
}

export function useCreateFinalInspection() {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<any>,
    AxiosError<ApiError>,
    { qrCode: string; operatorId: string }
  >({
    mutationFn: (data) => finalInspectionService.createFinalInspection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["final-inspections"] });
      queryClient.invalidateQueries({ queryKey: ["manual-final-inspections"] });
    },
  });
}
