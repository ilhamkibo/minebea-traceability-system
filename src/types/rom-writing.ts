import { PaginationParams } from "./pagination";

export interface RomWritingParams extends PaginationParams {
    datetime?: string
}

export interface RomWriting {
    id: number;
    qrCode: string;
    createdAt: string;
}