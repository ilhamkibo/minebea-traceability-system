// src/queries/useCameraChecks.ts
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { CameraCheck, CameraCheckParams } from '@/types/camera-check'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { cameraCheckService } from '@/services/cameraCheckService'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function useCameraChecks(params: MaybeRefOrGetter<CameraCheckParams>) {
    return useQuery<ApiResponse<CameraCheck[]>, AxiosError<ApiError>>({
        queryKey: computed(() => ['camera-checks', toValue(params)]),
        queryFn: () => cameraCheckService.getCameraChecks(toValue(params)),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}