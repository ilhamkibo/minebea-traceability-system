// src/composables/useDebounce.ts
import { ref, watch } from 'vue'

export function useDebounce<T>(value: T, delay = 500) {
    const debounced = ref(value)

    watch(
        () => value,
        (val) => {
            const timeout = setTimeout(() => {
                debounced.value = val
            }, delay)

            return () => clearTimeout(timeout)
        }
    )

    return debounced
}