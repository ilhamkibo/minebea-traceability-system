export type PcbData = {

}

export interface FinalInspection {
    id: number;
    qrCode: string;
    createdAt: string;
}

export interface VisualCheck {
    id: number;
    qrCode: string;
    judgement: string;
    timestamp: string;
}

export interface TouchUp {
    id: number;
    qrCode: string;
    judgement: string;
    timestamp: string;
}

export interface RomWriting {
    id: number;
    qrCode: string;
    judgement: string;
    timestamp: string;
}