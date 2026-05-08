import { PaginationParams } from "./pagination";

export interface CameraCheckParams extends PaginationParams {
    judgement?: string;
    datetime?: string;
}

export interface CameraCheck {
    id: number;
    qrCode: string;
    judgement: string;
    operatorName: string;
    createdAt: string;
}
