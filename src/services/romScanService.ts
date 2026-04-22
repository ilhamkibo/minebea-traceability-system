import api from "@/lib/api";
import { PaginationParams } from "@/types/pagination";
import type { RomScan } from "@/types/rom-scan";

class RomScanService {
    private baseUrl = '/rom_scan'

    async getRomScans(params: PaginationParams): Promise<RomScan[]> {
        const res = await api.get(this.baseUrl, { params })
        return res.data.data
    }

    async getRomScan(id: number): Promise<RomScan> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const romScanService = new RomScanService()