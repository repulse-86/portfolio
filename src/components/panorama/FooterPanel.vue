<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { PanoramaSection } from '@/types'

const emit = defineEmits<{
    navigate: [section: Exclude<PanoramaSection, 'footer'>]
}>()

interface FooterLink {
    label: string
    section?: Exclude<PanoramaSection, 'footer'>
    dot: string
    breakBefore?: boolean
}

const frameworks: FooterLink[] = [
    { label: 'spring boot', dot: 'bg-success' },
    { label: 'laravel', dot: 'bg-red' },
    { label: 'vue', dot: 'bg-tertiary' },
    { label: 'sql', dot: 'bg-brand-700' },
    { label: 'tailwind', dot: 'bg-primary' },
    { label: 'docker', dot: 'bg-zinc-950 dark:bg-white' },
]

const links: FooterLink[] = [
    {
        label: 'home',
        section: 'about',
        dot: 'bg-zinc-950 dark:bg-white',
    },
    { label: 'about', section: 'about', dot: 'bg-tertiary' },
    { label: 'experience', section: 'experience', dot: 'bg-primary' },
    { label: 'projects', section: 'projects', dot: 'bg-success' },
    {
        label: 'contact',
        section: 'contact',
        dot: 'bg-brand-600',
        breakBefore: true,
    },
]

const allItems = [...frameworks, ...links]
const activeCycleIndex = ref<number>(0)
const hoveredIndex = ref<number | null>(null)

let cycleTimer: number | null = null
let resumeTimeout: number | null = null

const startCycle = () => {
    if (cycleTimer) window.clearInterval(cycleTimer)
    cycleTimer = window.setInterval(() => {
        if (hoveredIndex.value === null) {
            activeCycleIndex.value = (activeCycleIndex.value + 1) % allItems.length
        }
    }, 1800)
}

const handleMouseEnter = (idx: number) => {
    hoveredIndex.value = idx
    if (cycleTimer) {
        window.clearInterval(cycleTimer)
        cycleTimer = null
    }
    if (resumeTimeout) {
        clearTimeout(resumeTimeout)
        resumeTimeout = null
    }
}

const handleMouseLeave = () => {
    hoveredIndex.value = null
    if (resumeTimeout) clearTimeout(resumeTimeout)
    resumeTimeout = window.setTimeout(() => {
        if (hoveredIndex.value === null) {
            startCycle()
        }
    }, 2500)
}

const isItemActive = (idx: number) => {
    return (
        hoveredIndex.value === idx ||
        (hoveredIndex.value === null && activeCycleIndex.value === idx)
    )
}

onMounted(() => {
    startCycle()
})

onUnmounted(() => {
    if (cycleTimer) window.clearInterval(cycleTimer)
    if (resumeTimeout) clearTimeout(resumeTimeout)
})
</script>

<template>
    <nav
        class="flex h-full w-full flex-wrap content-start items-start gap-x-2 gap-y-1 pt-2 pb-8 sm:gap-x-4"
        aria-label="Footer sections"
        @mouseleave="handleMouseLeave"
    >
        <span
            v-for="(fw, idx) in frameworks"
            :key="fw.label"
            class="inline-flex items-center cursor-pointer"
            @mouseenter="handleMouseEnter(idx)"
        >
            <span
                :class="[
                    'text-5xl sm:text-8xl font-black leading-[0.85] lowercase tracking-tighter transition-colors',
                    isItemActive(idx)
                        ? 'text-zinc-950 dark:text-white'
                        : 'text-zinc-300 dark:text-zinc-800',
                ]"
            >
                {{ fw.label }}
            </span>
            <span
                :class="[
                    'ml-2 inline-block h-3 w-3 flex-none rounded-full transition-colors sm:ml-4 sm:h-5 sm:w-5',
                    isItemActive(idx) ? fw.dot : 'bg-zinc-200 dark:bg-zinc-800',
                ]"
                aria-hidden="true"
            />
        </span>
        <span
            v-for="(link, lIdx) in links"
            :key="link.label"
            :class="['inline-flex items-center cursor-pointer', { 'basis-full': link.breakBefore }]"
            @mouseenter="handleMouseEnter(frameworks.length + lIdx)"
        >
            <button
                type="button"
                :class="[
                    'text-5xl sm:text-8xl font-black leading-[0.85] lowercase tracking-tighter transition-colors text-left',
                    isItemActive(frameworks.length + lIdx)
                        ? 'text-zinc-950 dark:text-white'
                        : 'text-zinc-300 dark:text-zinc-800',
                ]"
                @click="link.section && emit('navigate', link.section)"
            >
                {{ link.label }}
            </button>
            <span
                :class="[
                    'ml-2 inline-block h-3 w-3 flex-none rounded-full transition-colors sm:ml-4 sm:h-5 sm:w-5',
                    isItemActive(frameworks.length + lIdx)
                        ? link.dot
                        : 'bg-zinc-200 dark:bg-zinc-800',
                ]"
                aria-hidden="true"
            />
        </span>
    </nav>
</template>
