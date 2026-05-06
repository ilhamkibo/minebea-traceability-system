import { useQuery } from '@tanstack/vue-query'
import { pcbService } from '@/services/pcbService'
import { Ref, computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { PcbParams } from '@/types/pcb'

export function useRecentPcbs() {
  return useQuery({
    queryKey: ['recent-pcbs'],
    queryFn: () => pcbService.getPCBs({ page: 1, limit: 10 })
  })
}

export function usePcbsList(params: MaybeRefOrGetter<PcbParams>) {
  return useQuery({
    queryKey: computed(() => ['pcbs', toValue(params)]),
    queryFn: () => pcbService.getPCBs(toValue(params))
  })
}

export function usePcbDetail(id: Ref<number | undefined>) {
  return useQuery({
    queryKey: ['pcb-detail', id],
    queryFn: () => pcbService.getPCB(id.value!),
    enabled: computed(() => !!id.value)
  })
}
