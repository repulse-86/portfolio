import { onMounted, onUnmounted, type Ref } from 'vue'

interface WheelPagerOptions {
    skipClassName?: string
}

const WHEEL_STEP_COOLDOWN_MS = 350

export function useWheelPager(
    viewport: Ref<HTMLElement | null>,
    onStep: (direction: number) => void,
    options: WheelPagerOptions = {},
) {
    const getVerticalScroller = (target: EventTarget | null): HTMLElement | null => {
        if (!(target instanceof Element)) return null
        let node: Element | null = target
        while (node && node !== viewport.value) {
            if (node instanceof HTMLElement) {
                if (options.skipClassName && node.classList.contains(options.skipClassName)) {
                    node = node.parentElement
                    continue
                }
                const overflowY = getComputedStyle(node).overflowY
                if (
                    (overflowY === 'auto' || overflowY === 'scroll') &&
                    node.scrollHeight > node.clientHeight + 1
                ) {
                    return node
                }
            }
            node = node.parentElement
        }
        return null
    }

    let wheelLocked = false
    let wheelUnlockTimer: ReturnType<typeof setTimeout> | null = null

    const onWheel = (event: WheelEvent) => {
        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return

        if (getVerticalScroller(event.target)) return

        event.preventDefault()
        if (wheelLocked) return

        wheelLocked = true
        onStep(event.deltaY > 0 ? 1 : -1)
        wheelUnlockTimer = setTimeout(() => {
            wheelLocked = false
            wheelUnlockTimer = null
        }, WHEEL_STEP_COOLDOWN_MS)
    }

    onMounted(() => {
        viewport.value?.addEventListener('wheel', onWheel, { passive: false })
    })

    onUnmounted(() => {
        if (wheelUnlockTimer !== null) clearTimeout(wheelUnlockTimer)
        viewport.value?.removeEventListener('wheel', onWheel)
    })

    return { getVerticalScroller, onWheel }
}
