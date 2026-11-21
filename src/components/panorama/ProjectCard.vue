<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import type { Project } from '@/types'
import { TILE_SLIDE_CYCLE_MS, useTileSlideAnimation } from '@/composables/useTileSlideAnimation'

const props = defineProps<{
    project: Project
}>()

defineEmits<{
    select: []
}>()

const animating = ref(false)
let resetTimer: number | null = null

const BULLET_LINE = /^([-*•–]|\d+[.)])\s/

const tileText = computed(() => {
    const paragraph: string[] = []
    for (const line of props.project.description.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || BULLET_LINE.test(trimmed)) break
        paragraph.push(trimmed)
    }
    return paragraph.join(' ')
})

const trigger = () => {
    if (resetTimer !== null) window.clearTimeout(resetTimer)
    animating.value = false
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            animating.value = true
            resetTimer = window.setTimeout(() => {
                animating.value = false
                resetTimer = null
            }, TILE_SLIDE_CYCLE_MS)
        })
    })
}

useTileSlideAnimation(trigger)

onUnmounted(() => {
    if (resetTimer !== null) window.clearTimeout(resetTimer)
})
</script>

<template>
    <div
        class="group relative block aspect-[4/3] w-full self-start overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-600/60 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        :class="{ 'tile-animate': animating }"
    >
        <div
            class="tile-stack absolute inset-x-0 top-0 h-[200%]"
            :style="{ animationDuration: `${TILE_SLIDE_CYCLE_MS}ms` }"
        >
            <div class="tile-image relative h-1/2 w-full overflow-hidden">
                <img
                    v-if="project.thumbnailImages.length"
                    :src="project.thumbnailImages[0]"
                    :alt="`${project.title} preview`"
                    class="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div
                    v-else
                    class="absolute inset-0 opacity-[0.05] dark:opacity-[0.09] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"
                    aria-hidden="true"
                />

                <div
                    class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent"
                    aria-hidden="true"
                />

                <span
                    class="absolute top-1.5 right-1.5 rounded-md border border-white/10 bg-black/55 px-1 py-0.5 font-mono text-[8px] font-semibold tracking-wide text-white/90 uppercase backdrop-blur-sm sm:top-3 sm:right-3 sm:px-2 sm:py-1 sm:text-[10px] sm:tracking-wider"
                >
                    {{ project.techLabel }}
                </span>

                <div class="absolute inset-x-0 bottom-0 p-2.5 sm:p-4">
                    <h3
                        class="text-xs leading-tight font-bold text-white drop-shadow-md sm:text-base"
                    >
                        {{ project.title }}
                    </h3>
                    <button
                        type="button"
                        class="mt-0.5 inline-flex cursor-pointer items-center rounded-sm text-[8px] font-semibold tracking-widest text-brand-600 uppercase transition-colors hover:text-brand-500 focus:outline-none focus-visible:text-brand-500 focus-visible:ring-1 focus-visible:ring-brand-600/70 sm:mt-1.5 sm:text-[10px]"
                        :aria-label="`View details for ${project.title}`"
                        @click="$emit('select')"
                    >
                        View details
                        <i class="ph ph-arrow-right ml-1 text-[8px] sm:text-[10px]" />
                    </button>
                </div>
            </div>

            <div
                class="tile-cover relative h-1/2 w-full overflow-hidden bg-brand-600 text-white"
                aria-hidden="true"
            >
                <p class="p-2 text-[9px] leading-[1.3] font-medium sm:p-4 sm:text-[11px]">
                    {{ tileText }}
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tile-stack {
    transform: translateY(0);
}

.tile-animate .tile-stack {
    will-change: transform;
    animation: tile-stack-cycle 13000ms cubic-bezier(0.33, 0, 0.2, 1) both;
}

@keyframes tile-stack-cycle {
    0% {
        transform: translateY(0);
    }
    7.69% {
        transform: translateY(-23%);
    }
    46.15% {
        transform: translateY(-23%);
    }
    53.85% {
        transform: translateY(-50%);
    }
    92.31% {
        transform: translateY(-50%);
    }
    100% {
        transform: translateY(0);
    }
}
</style>
