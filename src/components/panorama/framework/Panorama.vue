<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { PANORAMA_CONTEXT, type PanoramaRegistration } from './panorama-context'

/*
 * Optional metric overrides. Values are any CSS length; when omitted the CSS
 * fallbacks apply (mobile 85vw/1rem/1.5rem, desktop 50vw/4rem/8rem).
 */
const props = defineProps<{
    unit?: string
    gap?: string
    pad?: string
    unitSm?: string
    gapSm?: string
    padSm?: string
}>()

const emit = defineEmits<{
    'section-change': [id: string]
    'index-change': [index: number]
}>()

const track = ref<HTMLElement | null>(null)
const registrations = ref<PanoramaRegistration[]>([])
const scrollLeft = ref(0)
const metrics = ref({ stride: 0, pad: 0 })
const trackWidth = ref(0)

const trackStyle = computed(() => ({
    '--pano-unit-base': props.unit,
    '--pano-gap-base': props.gap,
    '--pano-pad-base': props.pad,
    '--pano-unit-sm': props.unitSm,
    '--pano-gap-sm': props.gapSm,
    '--pano-pad-sm': props.padSm,
    '--pano-viewport': trackWidth.value > 0 ? `${trackWidth.value}px` : undefined,
}))

let frame: number | null = null
let resizeObserver: ResizeObserver | null = null

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/* Sections own their span; the framework only accumulates it into stops. */
const register = (entry: PanoramaRegistration) => {
    if (!registrations.value.some((item) => item.id === entry.id)) {
        registrations.value.push(entry)
    }
}

const unregister = (id: string) => {
    registrations.value = registrations.value.filter((item) => item.id !== id)
}

provide(PANORAMA_CONTEXT, { register, unregister })

const stops = computed(() => {
    let cursor = 0
    return registrations.value.map((entry) => {
        const span = Math.max(1, Math.round(entry.getSpan()))
        const stop = { id: entry.id, span, start: cursor }
        cursor += span
        return stop
    })
})

const totalStops = computed(() => stops.value.reduce((total, stop) => total + stop.span, 0))

/* One measure pass reads the standard metrics off the CSS, never content width. */
const measure = () => {
    const el = track.value
    if (!el) return

    trackWidth.value = el.clientWidth

    const pad = Number.parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0
    const first = el.querySelector<HTMLElement>('[data-pano-section]')

    if (!first) {
        metrics.value = { stride: 0, pad }
        return
    }

    const gap = Number.parseFloat(getComputedStyle(first).marginRight) || 0
    const span = stops.value[0]?.span ?? 1
    const unit = (first.getBoundingClientRect().width - (span - 1) * gap) / span

    metrics.value = { stride: unit + gap, pad }
}

const syncScroll = () => {
    if (frame !== null) return
    frame = requestAnimationFrame(() => {
        frame = null
        scrollLeft.value = track.value?.scrollLeft ?? 0
    })
}

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const scrollToIndex = (index: number) => {
    const el = track.value
    const { stride, pad } = metrics.value
    if (!el || stride <= 0) return

    el.scrollTo({
        left: clamp(index, 0, Math.max(0, totalStops.value - 1)) * stride + pad,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
}

const scrollToSection = (id: string, options: { lead?: number } = {}) => {
    const stop = stops.value.find((item) => item.id === id)
    if (!stop) return
    scrollToIndex(stop.start - (options.lead ?? 0))
}

const activeIndex = computed(() => {
    const { stride, pad } = metrics.value
    if (stride <= 0 || totalStops.value === 0) return 0
    return clamp(Math.round((scrollLeft.value - pad) / stride), 0, totalStops.value - 1)
})

const activeSection = computed(
    () =>
        stops.value.find(
            (stop) => activeIndex.value >= stop.start && activeIndex.value < stop.start + stop.span,
        )?.id ?? '',
)

const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollToIndex(activeIndex.value + 1)
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollToIndex(activeIndex.value - 1)
    }
}

watch(activeSection, (id) => {
    if (id) emit('section-change', id)
})

watch(activeIndex, (index) => emit('index-change', index))

watch(totalStops, () => nextTick(measure))

onMounted(() => {
    measure()
    window.addEventListener('resize', measure)

    if (track.value?.firstElementChild) {
        resizeObserver = new ResizeObserver(measure)
        resizeObserver.observe(track.value.firstElementChild)
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', measure)
    resizeObserver?.disconnect()
    if (frame !== null) cancelAnimationFrame(frame)
})

defineExpose({ scrollToSection, scrollToIndex, activeIndex, activeSection, totalStops })
</script>

<template>
    <main
        ref="track"
        class="pano-track"
        :style="trackStyle"
        tabindex="0"
        @scroll.passive="syncScroll"
        @keydown="onKeydown"
    >
        <div class="pano-inner">
            <slot />
            <div class="pano-trailing" aria-hidden="true" />
        </div>
    </main>
</template>

<style scoped>
/*
 * Panorama metrics. One regular section is --pano-unit wide, neighbors are
 * --pano-gap apart, and one tick travels --pano-stride. The *-base / *-sm
 * inputs come from props (or a consumer's inline style); the resolved tokens
 * are what sections read, so a prop override never beats the breakpoint.
 */
.pano-track {
    --pano-unit: var(--pano-unit-base, 85vw);
    --pano-gap: var(--pano-gap-base, 1rem);
    --pano-pad: var(--pano-pad-base, 1.5rem);
    --pano-stride: calc(var(--pano-unit) + var(--pano-gap));

    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-padding-left: var(--pano-pad);
    scroll-padding-right: var(--pano-pad);
    overscroll-behavior-x: contain;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
    outline: none;
}

@media (min-width: 640px) {
    .pano-track {
        --pano-unit: var(--pano-unit-sm, var(--pano-unit-base, 50vw));
        --pano-gap: var(--pano-gap-sm, var(--pano-gap-base, 4rem));
        --pano-pad: var(--pano-pad-sm, var(--pano-pad-base, 8rem));
    }
}

.pano-inner {
    display: flex;
    align-items: stretch;
    width: max-content;
    height: 100%;
    padding-left: var(--pano-pad);
}

/*
 * The last stop sits at pad + (totalStops - 1) * stride, so the track needs at
 * least its own width minus one stride of slack past the final section to reach
 * it without the scroll position being clamped short.
 */
.pano-trailing {
    flex: none;
    width: max(0px, calc(var(--pano-viewport, 100vw) - var(--pano-stride)));
}
</style>
