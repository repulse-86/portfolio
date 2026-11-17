<script setup lang="ts">
import type { Experience } from '@/types'
import { githubUrl } from '@/data/constants'
import TimelineItem from '@/components/ui/TimelineItem.vue'

defineProps<{
    experience: Experience[]
}>()
</script>

<template>
    <div class="h-full flex flex-col pt-0 pb-10 sm:pt-6">
        <div class="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
            <div class="space-y-3 lg:col-span-4">
                <span class="text-xs font-bold tracking-widest text-brand-600 uppercase"
                    >History</span
                >
                <h2 class="text-2xl font-bold tracking-tight">Work Experience</h2>
                <p
                    class="max-w-sm text-sm leading-relaxed font-light text-zinc-600 dark:text-zinc-400"
                >
                    A timeline outlining my professional history, freelance developments, and
                    technical agency roles.
                </p>
                <div class="pt-2">
                    <a
                        :href="githubUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-100 dark:hover:text-brand-200"
                    >
                        <i class="ph ph-github-logo mr-1.5 text-base" /> View GitHub Profile
                        <i class="ph ph-arrow-up-right ml-1" />
                    </a>
                </div>

                <div
                    class="mt-8 hidden items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-zinc-400 uppercase lg:flex dark:text-zinc-500"
                >
                    <i class="ph ph-mouse-scroll text-sm" /> Scroll to continue
                </div>
            </div>

            <div
                class="relative ml-3 space-y-12 border-l border-zinc-200 pl-6 md:ml-0 md:pl-8 lg:col-span-8 dark:border-zinc-800"
            >
                <TimelineItem
                    v-for="(job, index) in experience"
                    :key="index"
                    :period="job.period"
                    :title="job.title"
                    :organization="job.organization"
                    :responsibilities="job.responsibilities"
                />
            </div>
        </div>
    </div>
</template>
