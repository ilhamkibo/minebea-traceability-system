import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import type {
  FinalInspection,
  FinalInspectionParams,
} from "@/types/final-inspection";
import { cleanParams } from "@/utils/format";

class FinalInspectionService {
  private baseUrl = "/final_inspect";

  async getFinalInspections(
    params: FinalInspectionParams,
  ): Promise<ApiResponse<FinalInspection[]>> {
    const formatParams = cleanParams(params);
    const res = await api.get(this.baseUrl, { params: formatParams });
    return res.data;
  }

  async getFinalInspection(id: number): Promise<FinalInspection> {
    const res = await api.get(`${this.baseUrl}/${id}`);
    return res.data.data;
  }

  async createFinalInspection(data: {
    qrCode: string;
    operatorId: string;
  }): Promise<ApiResponse<any>> {
    const res = await api.post(this.baseUrl, data);
    return res.data;
  }

  async getManualFinalInspections(
    params: any,
  ): Promise<ApiResponse<FinalInspection[]>> {
    const formatParams = cleanParams(params);
    const res = await api.get(`${this.baseUrl}/manual`, {
      params: formatParams,
    });
    return res.data;
  }
}

export const finalInspectionService = new FinalInspectionService();
