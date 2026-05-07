import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import type { Operator, OperatorParams, CurrentOperator, OperatorAssignmentPayload } from "@/types/operator";
import { cleanParams } from "@/utils/format";

class OperatorService {
    private baseUrl = '/operators'

    async getOperators(params: OperatorParams): Promise<ApiResponse<Operator[]>> {
        const filterParams = cleanParams(params)
        const res = await api.get(this.baseUrl, { params: filterParams })
        return res.data
    }

    async getCurrentOperators(): Promise<ApiResponse<{ operators: CurrentOperator[] }>> {
        const res = await api.get(`${this.baseUrl}/current`)
        return res.data
    }

    async getOperator(id: number): Promise<Operator> {
        const res = await api.get(`${this.baseUrl}/${id}`)
        return res.data.data
    }

    async createOperator(data: { name: string }, pin: string): Promise<ApiResponse<Operator>> {
        const res = await api.post(this.baseUrl, data, {
            headers: { 'Authorization': pin }
        })
        return res.data
    }

    async updateOperator(id: number, data: { name: string }, pin: string): Promise<ApiResponse<Operator>> {
        const res = await api.patch(`${this.baseUrl}/${id}`, data, {
            headers: { 'Authorization': pin }
        })
        return res.data
    }

    async deleteOperator(id: number, pin: string): Promise<ApiResponse<void>> {
        const res = await api.delete(`${this.baseUrl}/${id}`, {
            headers: { 'Authorization': pin }
        })
        return res.data
    }

    async updateAssignments(data: OperatorAssignmentPayload[], pin: string): Promise<ApiResponse<void>> {
        const res = await api.patch(`${this.baseUrl}/assignment`, { assignments: data }, {
            headers: { 'Authorization': pin }
        })
        return res.data
    }
}

export const operatorService = new OperatorService()
