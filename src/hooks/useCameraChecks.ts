// src/queries/useCameraChecks.ts
import { useQuery } from '@tanstack/vue-query'
import { CameraCheckParams } from '@/types/camera-check'
import { cameraCheckService } from '@/services/cameraCheckService'

export function useCameraChecks(params: CameraCheckParams) {
    return useQuery({
        queryKey: ['camera-checks', params],
        queryFn: () => cameraCheckService.getCameraChecks(params),
        staleTime: 1000 * 10,
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
    })
}