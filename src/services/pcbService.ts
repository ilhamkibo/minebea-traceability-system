import api from "@/lib/api";
import { ApiResponse, PaginatedData } from "@/types/api-response";
import type { PcbData, PcbDetail, PcbParams } from "@/types/pcb";
import { cleanParams } from "@/utils/format";

class PCBService {
  private baseUrl = "/qr_code";

  // Overload: paginate: true → returns PaginatedData (with items, page, total, etc.)
  async getPCBs(params: PcbParams & { paginate: true }): Promise<ApiResponse<PaginatedData<PcbData>>>;
  // Overload: paginate: false / undefined → returns plain array
  async getPCBs(params: PcbParams & { paginate?: false }): Promise<ApiResponse<PcbData[]>>;
  // Implementation
  async getPCBs(params: PcbParams): Promise<ApiResponse<PaginatedData<PcbData> | PcbData[]>> {
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
