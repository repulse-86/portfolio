import { ref } from 'vue'

export function useTheme() {
    const darkMode = ref(true)

    const toggleTheme = () => {
        darkMode.value = !darkMode.value
        if (darkMode.value) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    return { darkMode, toggleTheme }
}
