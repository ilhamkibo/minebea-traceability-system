import { useQuery } from '@tanstack/vue-query'
import { pcbService } from '@/services/pcbService'
import { Ref, computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { PcbParams } from '@/types/pcb'

export function useRecentPcbs(refetchInterval?: number) {
  return useQuery({
    queryKey: ['recent-pcbs'],
    queryFn: () => pcbService.getPCBs({ page: 1, limit: 10 }),
    refetchInterval: refetchInterval ?? false
  })
}

export function usePcbsList(params: MaybeRefOrGetter<PcbParams>, refetchInterval?: number) {
  return useQuery({
    queryKey: computed(() => ['pcbs', toValue(params)]),
    queryFn: () => pcbService.getPCBs(toValue(params)),
    refetchInterval: refetchInterval ?? false
  })
}

export function usePcbDetail(id: Ref<number | undefined>) {
  return useQuery({
    queryKey: ['pcb-detail', id],
    queryFn: () => pcbService.getPCB(id.value!),
    enabled: computed(() => !!id.value)
  })
}
