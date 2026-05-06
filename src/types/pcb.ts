import { PaginationParams } from "./pagination";
import type { CameraCheck } from "./camera-check";
import type { VisualCheck } from "./visual-check";
import type { TouchUp } from "./touch-up";
import type { RomWriting } from "./rom-writing";
import type { FinalInspection } from "./final-inspection";

export interface PcbParams extends PaginationParams {
    datetime?: string;
    itemstatus?: string;
    daterange?: number;
}

export interface TimelineEvent {
    id: number;
    passed: boolean;
    createdAt: string;
    workFlowEventName: string;
    type: number;
}

// Utility type to replace qrCode string with qrCodeId number for nested relations
type WithQrCodeId<T> = Omit<T, 'qrCode'> & { qrCodeId: number };

export interface PcbData {
    id: number;
    value: string;
    itemStatus: string;
    lastAppearance: string;
    createdAt: string;
    cameraChecks?: WithQrCodeId<CameraCheck>[];
    visualChecks?: WithQrCodeId<VisualCheck>[];
    touchUps?: WithQrCodeId<TouchUp>[];
    romScans?: WithQrCodeId<RomWriting>[];
    finalInspecs?: WithQrCodeId<FinalInspection>[];
}

export interface PcbDetail extends Omit<PcbData, 'cameraChecks' | 'visualChecks' | 'touchUps' | 'romScans' | 'finalInspecs'> {
    timeLine: TimelineEvent[];
}
