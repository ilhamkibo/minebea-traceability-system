// src/services/cameraCheckService.ts
import api from '@/lib/api'
import { ApiResponse } from '@/types/api-response'
import type { CameraCheck, CameraCheckParams } from '@/types/camera-check'
import { cleanParams } from '@/utils/format'


class CameraCheckService {
    private baseUrl = '/camera_check'

    async getCameraChecks(params: CameraCheckParams): Promise<ApiResponse<CameraCheck[]>> {
        const filterParams = cleanParams(params)
        console.log("🚀 ~ CameraCheckService ~ getCameraChecks ~ filterParams:", filterParams)

        const res = await api.get(this.baseUrl, { params: filterParams })
        return res.data
    }

    async getCameraCheck(id: number): Promise<CameraCheck> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const cameraCheckService = new CameraCheckService()