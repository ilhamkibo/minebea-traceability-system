import api from '@/lib/api'
import { ApiResponse } from '@/types/api-response'
import type { FinalInspection, FinalInspectionParams } from '@/types/final-inspection'
import { cleanParams } from '@/utils/format'

class FinalInspectionService {
    private baseUrl = '/final_inspect'

    async getFinalInspections(params: FinalInspectionParams): Promise<ApiResponse<FinalInspection[]>> {
        const formatParams = cleanParams(params)
        const res = await api.get(this.baseUrl, { params: formatParams })
        return res.data
    }

    async getFinalInspection(id: number): Promise<FinalInspection> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const finalInspectionService = new FinalInspectionService()
