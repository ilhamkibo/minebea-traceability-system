// src/queries/useCameraChecks.ts
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { VisualCheck, VisualCheckParams } from '@/types/visual-check'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { visualCheckService } from '@/services/visualCheckService'

export function useVisualChecks(params: VisualCheckParams) {
    return useQuery<ApiResponse<VisualCheck[]>, AxiosError<ApiError>>({
        queryKey: ['visual-checks', params],
        queryFn: () => visualCheckService.getVisualChecks(params),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}