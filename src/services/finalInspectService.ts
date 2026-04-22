import api from "@/lib/api";
import { PaginationParams } from "@/types/pagination";
import type { FinalInspect } from "@/types/final-inspect";

class FinalInspectService {
    private baseUrl = '/final_inspect'

    async getFinalInspects(params: PaginationParams): Promise<FinalInspect[]> {
        const res = await api.get(this.baseUrl, { params })
        return res.data.data
    }

    async getFinalInspect(id: number): Promise<FinalInspect> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const finalInspectService = new FinalInspectService()