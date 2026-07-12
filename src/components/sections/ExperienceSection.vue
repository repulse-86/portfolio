<script setup lang="ts">
import type { Experience } from '@/types'
import { githubUrl } from '@/data/constants'
import TimelineItem from '@/components/ui/TimelineItem.vue'

defineProps<{
    experience: Experience[]
}>()
</script>

<template>
    <section id="experience" class="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-5 space-y-4">
            <span class="text-xs uppercase font-bold tracking-widest text-brand-600">History</span>
            <h2 class="text-3xl font-bold tracking-tight">Work Experience</h2>
            <p class="text-sm text-zinc-600 dark:text-zinc-400 font-light pr-6 pt-2">
                A timeline outlining my professional history, freelance developments, and technical
                agency roles.
            </p>
            <div class="pt-4">
                <a
                    :href="githubUrl"
                    target="_blank"
                    class="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-100 dark:hover:text-brand-200 transition-colors"
                >
                    <i class="ph ph-github-logo mr-1.5 text-base" /> View GitHub Profile
                    <i class="ph ph-arrow-up-right ml-1" />
                </a>
            </div>
        </div>

        <div
            class="lg:col-span-7 relative border-l border-zinc-200 dark:border-zinc-800 ml-3 md:ml-0 pl-6 md:pl-8 space-y-12"
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
    </section>
</template>
