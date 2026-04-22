import api from "@/lib/api";
import { PaginationParams } from "@/types/pagination";
import type { PcbData } from "@/types/pcb";

class PCBService {
    private baseUrl = '/qr_code'

    async getPCBs(params: PaginationParams): Promise<PcbData[]> {
        const res = await api.get(this.baseUrl, { params })
        return res.data.data
    }

    async getPCB(id: number): Promise<PcbData> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const pcbService = new PCBService()