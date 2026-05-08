import { PaginationParams } from "./pagination";

export interface RomWritingParams extends PaginationParams {
    datetime?: string
}

export interface RomWriting {
    id: number;
    operatorName: string;
    qrCode: string;
    createdAt: string;
}