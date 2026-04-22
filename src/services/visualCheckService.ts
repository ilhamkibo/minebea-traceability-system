// src/services/cameraCheckService.ts
import api from '@/lib/api'
import type { VisualCheck, VisualCheckParams } from '@/types/visual-check'


class VisualCheckService {
    private baseUrl = '/visual_check'

    async getVisualChecks(params: VisualCheckParams): Promise<VisualCheck[]> {
        const res = await api.get(this.baseUrl, { params })
        return res.data.data
    }

    async getVisualCheck(id: number): Promise<VisualCheck> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const visualCheckService = new VisualCheckService()