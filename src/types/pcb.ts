import { PaginationParams } from "./pagination";
import type { CameraCheck } from "./camera-check";
import type { VisualCheck } from "./visual-check";
import type { TouchUp } from "./touch-up";
import type { RomWriting } from "./rom-writing";
import type { FinalInspection } from "./final-inspection";

export interface PcbParams extends PaginationParams {
    datetime?: string;
    datetimeto?: string;
    itemstatus?: string;
    daterange?: number;
}

export interface TimelineEvent {
    id: number;
    passed: boolean;
    operatorName: string;
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
    // TODO(romscan): ROM Writing data — uncomment when RomScan service is ready
    // romScans?: WithQrCodeId<RomWriting>[];
    finalInspecs?: WithQrCodeId<FinalInspection>[];
}

// TODO(romscan): add 'romScans' back to Omit when RomScan field is uncommented above
export interface PcbDetail extends Omit<PcbData, 'cameraChecks' | 'visualChecks' | 'touchUps' | 'romScans' | 'finalInspecs'> {
    timeLine: TimelineEvent[];
}
