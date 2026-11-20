import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useMediaQuery(queryString: string): Ref<boolean> {
    const matches = ref(
        typeof window !== 'undefined' ? window.matchMedia(queryString).matches : false,
    )

    let query: MediaQueryList | null = null
    const sync = () => {
        matches.value = query?.matches ?? false
    }

    onMounted(() => {
        query = window.matchMedia(queryString)
        sync()
        query.addEventListener('change', sync)
    })

    onUnmounted(() => {
        query?.removeEventListener('change', sync)
    })

    return matches
}
