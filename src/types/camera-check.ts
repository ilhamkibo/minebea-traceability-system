import { PaginationParams } from "./pagination";

export interface CameraCheckParams extends PaginationParams {
    judgement?: string;
}

export interface CameraCheck {
    id: number;
    qrCode: string;
    judgement: string;
    timestamp: string;
}
