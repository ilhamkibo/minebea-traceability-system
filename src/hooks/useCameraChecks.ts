// src/queries/useCameraChecks.ts
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { CameraCheck, CameraCheckParams } from '@/types/camera-check'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { cameraCheckService } from '@/services/cameraCheckService'

export function useCameraChecks(params: CameraCheckParams) {
    return useQuery<ApiResponse<CameraCheck[]>, AxiosError<ApiError>>({
        queryKey: ['camera-checks', params],
        queryFn: () => cameraCheckService.getCameraChecks(params),
        staleTime: 1000 * 10,
        // refetchInterval: 15000,
        refetchOnWindowFocus: true,
    })
}