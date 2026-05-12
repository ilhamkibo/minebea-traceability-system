// TODO(romscan): RomScan service not yet implemented on the backend.
// The /rom_scan API endpoint does not exist yet.
// Keep this file as a stub for future implementation.

import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import type { RomWriting, RomWritingParams } from "@/types/rom-writing";
import { cleanParams } from "@/utils/format";

class RomScanService {
    private baseUrl = '/rom_scan'

    async getRomScanWritings(params: RomWritingParams): Promise<ApiResponse<RomWriting[]>> {
        const formatParams = cleanParams(params)
        const res = await api.get(this.baseUrl, { params: formatParams })
        return res.data.data
    }

    async getRomWriting(id: number): Promise<ApiResponse<RomWriting>> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }
}

export const romScanService = new RomScanService()