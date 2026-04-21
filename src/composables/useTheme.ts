import { ref, onMounted } from 'vue'

export function useTheme() {
    const isDark = ref(false)

    const initTheme = () => {
        const storedTheme = localStorage.getItem('theme')
        if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            isDark.value = true
            document.documentElement.classList.add('dark')
        } else {
            isDark.value = false
            document.documentElement.classList.remove('dark')
        }
    }

    const toggleTheme = () => {
        isDark.value = !isDark.value
        if (isDark.value) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    onMounted(() => {
        initTheme()
    })

    return {
        isDark,
        toggleTheme
    }
}
