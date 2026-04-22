import { PaginationParams } from "./pagination";

export interface VisualCheck {
    id: number;
    qrCode: string;
    judgement: string;
    createdAt: string;
}

export interface VisualCheckParams extends PaginationParams {
    judgement?: string;
    datetime?: string;
}