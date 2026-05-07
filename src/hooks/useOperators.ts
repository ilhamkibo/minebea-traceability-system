import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import type { AxiosError } from 'axios'
import type { Operator, OperatorParams, CurrentOperator, OperatorAssignmentPayload } from '@/types/operator'
import type { ApiError, ApiResponse } from '@/types/api-response'
import { operatorService } from '@/services/operatorService'

export function useOperatorsList(params: OperatorParams) {
    return useQuery<ApiResponse<Operator[]>, AxiosError<ApiError>>({
        queryKey: ['operators', params],
        queryFn: () => operatorService.getOperators(params),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}

export function useCreateOperator() {
    const queryClient = useQueryClient()
    return useMutation<ApiResponse<Operator>, AxiosError<ApiError>, { name: string; pin: string }>({
        mutationFn: ({ name, pin }) => operatorService.createOperator({ name }, pin),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operators'] })
        }
    })
}

export function useUpdateOperator() {
    const queryClient = useQueryClient()
    return useMutation<ApiResponse<Operator>, AxiosError<ApiError>, { id: number; name: string; pin: string }>({
        mutationFn: ({ id, name, pin }) => operatorService.updateOperator(id, { name }, pin),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operators'] })
        }
    })
}

export function useDeleteOperator() {
    const queryClient = useQueryClient()
    return useMutation<ApiResponse<void>, AxiosError<ApiError>, { id: number; pin: string }>({
        mutationFn: ({ id, pin }) => operatorService.deleteOperator(id, pin),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operators'] })
        }
    })
}

export function useCurrentOperators() {
    return useQuery<ApiResponse<{ operators: CurrentOperator[] }>, AxiosError<ApiError>>({
        queryKey: ['operators', 'current'],
        queryFn: () => operatorService.getCurrentOperators(),
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
    })
}

export function useUpdateAssignments() {
    const queryClient = useQueryClient()
    return useMutation<ApiResponse<void>, AxiosError<ApiError>, { data: OperatorAssignmentPayload[]; pin: string }>({
        mutationFn: ({ data, pin }) => operatorService.updateAssignments(data, pin),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operators'] })
            queryClient.invalidateQueries({ queryKey: ['operators', 'current'] })
        }
    })
}
