<script setup lang="ts">
import type { Project } from '@/types'

defineProps<{
    project: Project
}>()

defineEmits<{
    select: []
}>()

const CLICK_TO_OPEN = false
</script>

<template>
    <button
        type="button"
        class="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-600/60 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-zinc-800 dark:bg-zinc-900"
        :aria-label="`Open ${project.title} project details`"
        :disabled="!CLICK_TO_OPEN"
        @click="CLICK_TO_OPEN && $emit('select')"
    >
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
            <h3 class="text-xs leading-tight font-bold text-white drop-shadow-md sm:text-base">
                {{ project.title }}
            </h3>
            <span
                class="mt-0.5 inline-flex items-center text-[8px] font-semibold tracking-widest text-white/60 uppercase transition-colors group-hover:text-white sm:mt-1.5 sm:text-[10px]"
            >
                View details
                <i class="ph ph-arrow-right ml-1 text-[8px] sm:text-[10px]" />
            </span>
        </div>
    </button>
</template>
