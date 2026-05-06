import { useQuery } from "@tanstack/vue-query";
import { RomWritingParams, RomWriting } from "@/types/rom-writing";
import { romScanService } from "@/services/romWritingService";
import type { ApiResponse, ApiError } from "@/types/api-response";
import type { AxiosError } from "axios";

export function useRomWritings(params: RomWritingParams) {
    return useQuery<ApiResponse<RomWriting[]>, AxiosError<ApiError>>({
        queryKey: ['rom-scans', params],
        queryFn: () => romScanService.getRomScanWritings(params),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}