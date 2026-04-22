// composables/useProcessName.ts
import { formatTitle } from '@/utils/format'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useProcessName() {
    const route = useRoute()

    const processName = computed(() => {
        return formatTitle(route.params.id as string)
    })

    return { processName }
}