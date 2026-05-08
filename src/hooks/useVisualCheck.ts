// src/queries/useVisualChecks.ts
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { VisualCheck, VisualCheckParams } from '@/types/visual-check'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { visualCheckService } from '@/services/visualCheckService'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function useVisualChecks(params: MaybeRefOrGetter<VisualCheckParams>) {
    return useQuery<ApiResponse<VisualCheck[]>, AxiosError<ApiError>>({
        queryKey: computed(() => ['visual-checks', toValue(params)]),
        queryFn: () => visualCheckService.getVisualChecks(toValue(params)),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}