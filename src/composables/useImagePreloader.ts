import { onMounted } from 'vue'

export function useImagePreloader(urls: string[]) {
    onMounted(() => {
        urls.forEach((url) => {
            const img = new Image()
            img.src = url
        })
    })
}
