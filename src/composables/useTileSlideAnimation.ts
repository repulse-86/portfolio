import { onMounted, onUnmounted } from 'vue'

export const TILE_SLIDE_CYCLE_MS = 13000

const INITIAL_DELAY_MS = 3000

const TILE_ANIMATION_CHANCE = 0.5

const STAGGER_MIN_MS = 500
const STAGGER_MAX_MS = 5000

const NEXT_BATCH_GAP_MS = 2000

const EMPTY_BATCH_RETRY_MS = 4000

type PulseListener = () => void

const listeners = new Set<PulseListener>()
const staggerTimers = new Set<number>()
let pulseTimer: number | null = null

const clearStaggerTimers = () => {
    staggerTimers.forEach((timer) => window.clearTimeout(timer))
    staggerTimers.clear()
}

const stopPulseIfIdle = () => {
    if (listeners.size > 0) return
    if (pulseTimer !== null) {
        window.clearTimeout(pulseTimer)
        pulseTimer = null
    }
    clearStaggerTimers()
}

const runBatch = () => {
    pulseTimer = null

    const batch = [...listeners].filter(() => Math.random() < TILE_ANIMATION_CHANCE)

    if (batch.length === 0) {
        pulseTimer = window.setTimeout(runBatch, EMPTY_BATCH_RETRY_MS)
        return
    }

    let delay = 0
    batch.forEach((animate, index) => {
        const start = () => {
            if (listeners.has(animate)) animate()
        }

        if (index > 0) {
            delay += STAGGER_MIN_MS + Math.random() * (STAGGER_MAX_MS - STAGGER_MIN_MS)
        }

        if (delay === 0) {
            start()
            return
        }

        const timer = window.setTimeout(() => {
            staggerTimers.delete(timer)
            start()
        }, delay)
        staggerTimers.add(timer)
    })

    const batchDuration = delay + TILE_SLIDE_CYCLE_MS
    pulseTimer = window.setTimeout(runBatch, batchDuration + NEXT_BATCH_GAP_MS)
}

const startPulse = () => {
    if (pulseTimer !== null) return
    pulseTimer = window.setTimeout(runBatch, INITIAL_DELAY_MS)
}

export function useTileSlideAnimation(onPulse: PulseListener) {
    onMounted(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        listeners.add(onPulse)
        startPulse()
    })

    onUnmounted(() => {
        listeners.delete(onPulse)
        stopPulseIfIdle()
    })
}
