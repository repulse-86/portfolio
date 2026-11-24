import { nextTick, ref } from 'vue'
import { prefersReducedMotion } from '@/utils/media'

export type TurnstileDirection = 'forward' | 'backward'

const STAGGER_MS = 34
const OUT_DURATION_MS = 230
const IN_DURATION_MS = 340
const BACKWARD_STAGGER_FACTOR = 0.85

const PHASE_CLASSES = [
    'turnstile--fwd-out',
    'turnstile--fwd-in-start',
    'turnstile--fwd-in',
    'turnstile--back-out',
    'turnstile--back-in-start',
    'turnstile--back-in',
] as const

type PhaseClass = (typeof PHASE_CLASSES)[number]

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))
const nextFrame = () =>
    new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )

export function useTurnstileAnimation() {
    const isAnimating = ref(false)

    const clearPhase = (elements: HTMLElement[]) => {
        elements.forEach((el) => {
            PHASE_CLASSES.forEach((c) => el.classList.remove(c))
            el.classList.remove('turnstile-item')
            el.style.removeProperty('--turn-delay')
        })
    }

    const applyPhase = (elements: HTMLElement[], phase: PhaseClass, reverse: boolean) => {
        const total = elements.length
        elements.forEach((el, index) => {
            const i = reverse ? Math.max(0, total - 1 - index) : index
            const delay = i * STAGGER_MS * (reverse ? BACKWARD_STAGGER_FACTOR : 1)
            el.style.setProperty('--turn-delay', `${delay}ms`)
            el.classList.add('turnstile-item')
            PHASE_CLASSES.forEach((c) => el.classList.remove(c))
            el.classList.add(phase)
        })
    }

    const turn = async ({
        direction,
        getOutgoing,
        getIncoming,
        swap,
    }: {
        direction: TurnstileDirection
        getOutgoing: () => HTMLElement[]
        getIncoming: () => HTMLElement[]
        swap: () => void
    }) => {
        if (isAnimating.value) return
        isAnimating.value = true

        try {
            const outgoing = getOutgoing()

            if (prefersReducedMotion() || outgoing.length === 0) {
                swap()
                await nextTick()
                clearPhase(getIncoming())
                return
            }

            const isForward = direction === 'forward'
            const reverse = !isForward
            const staggerFactor = reverse ? BACKWARD_STAGGER_FACTOR : 1
            const exitPhase: PhaseClass = isForward ? 'turnstile--fwd-out' : 'turnstile--back-out'
            const startPhase: PhaseClass = isForward
                ? 'turnstile--fwd-in-start'
                : 'turnstile--back-in-start'
            const enterPhase: PhaseClass = isForward ? 'turnstile--fwd-in' : 'turnstile--back-in'

            applyPhase(outgoing, exitPhase, reverse)
            await wait((OUT_DURATION_MS + outgoing.length * STAGGER_MS * staggerFactor) * 0.78)

            swap()
            await nextTick()

            const incoming = getIncoming()
            if (incoming.length === 0) {
                clearPhase(outgoing)
                return
            }

            applyPhase(incoming, startPhase, reverse)
            await nextFrame()

            applyPhase(incoming, enterPhase, reverse)
            await wait(IN_DURATION_MS + incoming.length * STAGGER_MS * staggerFactor)
            clearPhase(incoming)
        } finally {
            isAnimating.value = false
        }
    }

    return { isAnimating, turn }
}
