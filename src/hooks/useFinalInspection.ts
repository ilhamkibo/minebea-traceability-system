import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { FinalInspection, FinalInspectionParams } from '@/types/final-inspection'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { finalInspectionService } from '@/services/finalInspectionService'

export function useFinalInspections(params: FinalInspectionParams) {
    return useQuery<ApiResponse<FinalInspection[]>, AxiosError<ApiError>>({
        queryKey: ['final-inspections', params],
        queryFn: () => finalInspectionService.getFinalInspections(params),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}
