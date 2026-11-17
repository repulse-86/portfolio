import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'

interface LightboxOptions {
    preventDefault?: boolean
}

export function useLightbox(
    images: MaybeRefOrGetter<readonly string[]>,
    options: LightboxOptions = {},
) {
    const index = ref<number | null>(null)

    const current = computed(() => {
        const list = toValue(images)
        return index.value !== null ? (list[index.value] ?? null) : null
    })

    const total = computed(() => toValue(images).length)

    const open = (target: number) => {
        if (!toValue(images)[target]) return
        index.value = target
    }

    const close = () => {
        index.value = null
    }

    const prev = () => {
        if (index.value === null || total.value === 0) return
        index.value = (index.value - 1 + total.value) % total.value
    }

    const next = () => {
        if (index.value === null || total.value === 0) return
        index.value = (index.value + 1) % total.value
    }

    const handleKeydown = (event: KeyboardEvent): boolean => {
        if (index.value === null) return false

        const isEscape = event.key === 'Escape'
        const isPrevious = event.key === 'ArrowLeft'
        const isNext = event.key === 'ArrowRight'
        if (!isEscape && !isPrevious && !isNext) return false

        if (options.preventDefault) event.preventDefault()
        if (isEscape) close()
        else if (isPrevious) prev()
        else next()
        return true
    }

    return { index, current, total, open, close, prev, next, handleKeydown }
}
