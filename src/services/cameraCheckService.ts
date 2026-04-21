// src/services/cameraCheckService.ts
import api from '@/lib/api'
import type { CameraCheck, CameraCheckParams } from '@/types/camera-check'


class CameraCheckService {
    private baseUrl = '/camera-check'

    async getCameraChecks(params: CameraCheckParams): Promise<CameraCheck[]> {
        const res = await api.get(this.baseUrl, { params })
        return res.data.data
    }
}

export const cameraCheckService = new CameraCheckService()