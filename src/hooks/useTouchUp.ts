import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { TouchUp, TouchUpParams } from '@/types/touch-up'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { touchUpService } from '@/services/touchUpService'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function useTouchUps(params: MaybeRefOrGetter<TouchUpParams>) {
    return useQuery<ApiResponse<TouchUp[]>, AxiosError<ApiError>>({
        queryKey: computed(() => ['touch-ups', toValue(params)]),
        queryFn: () => touchUpService.getTouchUps(toValue(params)),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}
