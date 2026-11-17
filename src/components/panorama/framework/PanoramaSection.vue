<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { PANORAMA_CONTEXT } from './panorama-context'

const props = withDefaults(
    defineProps<{
        id: string
        title?: string
        /** Width in regular-section units. Integer >= 1. */
        span?: number
        /** Span to use from the 640px breakpoint up, if it differs. */
        spanSm?: number
        /** Let the body scroll vertically when its content is taller than the section. */
        scrollable?: boolean
    }>(),
    { span: 1, spanSm: undefined, title: undefined, scrollable: false },
)

const context = inject(PANORAMA_CONTEXT, null)

const wide = ref(false)
let query: ReturnType<typeof window.matchMedia> | null = null

const syncWide = () => {
    wide.value = query?.matches ?? false
}

const baseSpan = computed(() => Math.max(1, Math.round(props.span)))
const smSpan = computed(() =>
    props.spanSm ? Math.max(1, Math.round(props.spanSm)) : baseSpan.value,
)

/** Registered so the parent can build its stop table; reads reactive state. */
const getSpan = () => (wide.value ? smSpan.value : baseSpan.value)

/** Anchors cover the largest span seen at any breakpoint; duplicates are harmless. */
const anchorCount = computed(() => Math.max(baseSpan.value, smSpan.value))

context?.register({ id: props.id, getSpan })

onMounted(() => {
    query = window.matchMedia('(min-width: 640px)')
    syncWide()
    query.addEventListener('change', syncWide)
})

onUnmounted(() => {
    query?.removeEventListener('change', syncWide)
    context?.unregister(props.id)
})
</script>

<template>
    <section
        :id="props.id"
        data-pano-section
        class="pano-section"
        :style="{
            '--pano-span': baseSpan,
            '--pano-span-sm': props.spanSm ? smSpan : undefined,
        }"
    >
        <div v-if="props.title || $slots.header" class="pano-section-header">
            <slot name="header">
                <h2 class="pano-section-title">{{ props.title }}</h2>
            </slot>
        </div>

        <div class="pano-section-body" :class="{ 'pano-section-body--scroll': props.scrollable }">
            <slot />
        </div>

        <div
            v-for="anchor in anchorCount - 1"
            :key="anchor"
            class="pano-anchor"
            :style="{ left: `calc(var(--pano-stride) * ${anchor})` }"
            aria-hidden="true"
        />
    </section>
</template>

<style scoped>
.pano-section {
    --pano-span-current: var(--pano-span, 1);

    position: relative;
    flex: none;
    height: 100%;
    display: flex;
    flex-direction: column;
    width: calc(
        var(--pano-unit) * var(--pano-span-current) + var(--pano-gap) *
            (var(--pano-span-current) - 1)
    );
    margin-right: var(--pano-gap);
    scroll-snap-align: start;
    scroll-snap-stop: always;
}

@media (min-width: 640px) {
    .pano-section {
        --pano-span-current: var(--pano-span-sm, var(--pano-span, 1));
    }
}

.pano-section-header {
    flex: none;
}

.pano-section-body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.pano-section-body--scroll {
    overflow-y: auto;
    overscroll-behavior-y: contain;
}

/*
 * Extra snap stops inside a wide section. Absolutely positioned so the section
 * stays one continuous box: no layout, no gaps, no nested containers.
 */
.pano-anchor {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    pointer-events: none;
    scroll-snap-align: start;
    scroll-snap-stop: always;
}
</style>
