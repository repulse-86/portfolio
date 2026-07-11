import { ref, onMounted } from 'vue'

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

    onMounted(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'light') {
            darkMode.value = false
            document.documentElement.classList.remove('dark')
        } else {
            darkMode.value = true
            document.documentElement.classList.add('dark')
        }
    })

    return { darkMode, toggleTheme }
}
