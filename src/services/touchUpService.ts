// src/services/touchUpService.ts
import api from '@/lib/api'
import { ApiResponse } from '@/types/api-response'
import type { TouchUp, TouchUpParams } from '@/types/touch-up'
import { cleanParams } from '@/utils/format'


class TouchUpService {
    private baseUrl = '/touch_up'

    async getTouchUps(params: TouchUpParams): Promise<ApiResponse<TouchUp[]>> {
        const formatParams = cleanParams(params)
        const res = await api.get(this.baseUrl, { params: formatParams })
        return res.data
    }

    async getTouchUp(id: number): Promise<TouchUp> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const touchUpService = new TouchUpService()
