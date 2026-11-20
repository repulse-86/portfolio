<script setup lang="ts">
import type { Experience } from '@/types'
import TimelineItem from '@/components/shared/TimelineItem.vue'

defineProps<{
    experience: Experience[]
}>()
</script>

<template>
    <div class="min-h-full flex flex-col pt-0 pb-8 sm:pt-6">
        <div
            class="relative ml-3 space-y-12 border-l border-zinc-200 pl-6 md:pl-8 dark:border-zinc-800"
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
</template>
