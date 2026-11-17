export function useTheme() {
    const isDark = () => document.documentElement.classList.contains('dark')

    const toggleTheme = () => {
        const next = !isDark()
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    return { toggleTheme }
}
