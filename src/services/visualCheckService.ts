// src/services/cameraCheckService.ts
import api from '@/lib/api'
import { ApiResponse } from '@/types/api-response'
import type { VisualCheck, VisualCheckParams } from '@/types/visual-check'
import { cleanParams } from '@/utils/format'


class VisualCheckService {
    private baseUrl = '/visual_check'

    async getVisualChecks(params: VisualCheckParams): Promise<ApiResponse<VisualCheck[]>> {
        const formatParams = cleanParams(params)
        const res = await api.get(this.baseUrl, { params: formatParams })
        return res.data
    }

    async getVisualCheck(id: number): Promise<VisualCheck> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const visualCheckService = new VisualCheckService()