<script setup lang="ts">
import { contactIntro } from '@/data/profile'
import { email, featuredDemoUrl, githubUrl } from '@/data/site'

defineProps<{
    copyBtnText: string
}>()

defineEmits<{
    copy: []
}>()
</script>

<template>
    <div class="flex flex-1 min-h-0 flex-col pt-0 pb-8 sm:pt-6 w-full justify-between relative">
        <div class="space-y-6 w-full">
            <h2
                class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none lowercase"
            >
                let's connect.
            </h2>
            <p
                class="text-base sm:text-lg leading-relaxed font-light text-zinc-600 dark:text-zinc-400 max-w-lg"
            >
                {{ contactIntro }}
            </p>
        </div>

        <svg
            class="pointer-events-none absolute block left-[32%] top-[34%] w-36 h-36 sm:left-[42%] sm:top-[26%] sm:w-60 sm:h-60 lg:w-72 lg:h-72 text-blue-500 dark:text-blue-500 animate-pulse"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
        >
            <g transform="rotate(45 50 50)">
                <line x1="-12" y1="50" x2="94" y2="50" stroke="currentColor" stroke-width="2" />
                <polygon points="100,50 88,43 88,57" fill="currentColor" />
            </g>
        </svg>

        <div class="mt-auto w-full pt-12 pb-6 flex flex-col items-end gap-4">
            <a
                :href="`mailto:${email}`"
                class="text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight hover:underline decoration-4 underline-offset-4 break-words text-right"
            >
                {{ email }}
            </a>

            <button
                type="button"
                class="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-max whitespace-nowrap shrink-0"
                @click="$emit('copy')"
            >
                {{ copyBtnText }}
            </button>
        </div>

        <div class="mt-6 flex flex-col sm:flex-row sm:items-end justify-end gap-6 w-full">
            <div
                class="flex flex-col sm:flex-row gap-2 sm:gap-8 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400"
            >
                <a
                    :href="githubUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:underline underline-offset-4 flex items-center gap-1.5"
                >
                    GitHub <span class="text-base leading-none">↗</span>
                </a>
                <a
                    :href="featuredDemoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:underline underline-offset-4 flex items-center gap-1.5"
                >
                    Live Demo <span class="text-base leading-none">↗</span>
                </a>
            </div>
        </div>
    </div>
</template>
