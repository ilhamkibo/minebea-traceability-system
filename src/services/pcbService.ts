import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import type { PcbData, PcbDetail, PcbParams } from "@/types/pcb";
import { cleanParams } from "@/utils/format";

class PCBService {
  private baseUrl = "/qr_code";

  async getPCBs(params: PcbParams): Promise<ApiResponse<PcbData[]>> {
    const filterParams = cleanParams(params);
    const res = await api.get(this.baseUrl, { params: filterParams });
    return res.data;
  }

  async getPCB(id: number): Promise<PcbDetail> {
    const res = await api.get(`${this.baseUrl}/${id}`);
    return res.data.data;
  }
}

export const pcbService = new PCBService();
