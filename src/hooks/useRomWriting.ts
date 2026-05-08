import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { RomWriting, RomWritingParams } from '@/types/rom-writing'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { romScanService } from '@/services/romWritingService'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function useRomWritings(params: MaybeRefOrGetter<RomWritingParams>) {
    return useQuery<ApiResponse<RomWriting[]>, AxiosError<ApiError>>({
        queryKey: computed(() => ['rom-writings', toValue(params)]),
        queryFn: () => romScanService.getRomScanWritings(toValue(params)),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}