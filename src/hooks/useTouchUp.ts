import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { TouchUp, TouchUpParams } from '@/types/touch-up'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { touchUpService } from '@/services/touchUpService'

export function useTouchUps(params: TouchUpParams) {
    return useQuery<ApiResponse<TouchUp[]>, AxiosError<ApiError>>({
        queryKey: ['touch-ups', params],
        queryFn: () => touchUpService.getTouchUps(params),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}
