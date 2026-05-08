import { PaginationParams } from "./pagination";

export interface VisualCheck {
    id: number;
    qrCode: string;
    operatorName: string;
    judgement: string;
    createdAt: string;
}

export interface VisualCheckParams extends PaginationParams {
    judgement?: string;
    datetime?: string;
}