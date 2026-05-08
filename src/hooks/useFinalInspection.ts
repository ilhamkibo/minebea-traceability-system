import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { FinalInspection, FinalInspectionParams } from '@/types/final-inspection'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { finalInspectionService } from '@/services/finalInspectionService'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function useFinalInspections(params: MaybeRefOrGetter<FinalInspectionParams>) {
    return useQuery<ApiResponse<FinalInspection[]>, AxiosError<ApiError>>({
        queryKey: computed(() => ['final-inspections', toValue(params)]),
        queryFn: () => finalInspectionService.getFinalInspections(toValue(params)),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}
