import { PaginationParams } from "./pagination";

export interface FinalInspectionParams extends PaginationParams {
    datetime?: string;
}

export interface FinalInspection {
    id: number;
    qrCode: string;
    operatorName: string;
    createdAt: string;
}
