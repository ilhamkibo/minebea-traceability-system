import api from "@/lib/api";
import { PaginationParams } from "@/types/pagination";
import type { TouchUp } from "@/types/touch-up";

class TouchUpService {
    private baseUrl = '/touch_up'

    async getTouchUps(params: PaginationParams): Promise<TouchUp[]> {
        const res = await api.get(this.baseUrl, { params })
        return res.data.data
    }

    async getTouchUp(id: number): Promise<TouchUp> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const touchUpService = new TouchUpService()