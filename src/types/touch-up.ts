import { PaginationParams } from "./pagination";

export interface TouchUpParams extends PaginationParams {
    datetime?: string;
}

export interface TouchUp {
    id: number;
    qrCode: string;
    operatorName: string;
    createdAt: string;
}
