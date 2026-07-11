<script setup lang="ts">
defineProps<{
    period: string
    title: string
    organization: string
    responsibilities: string[]
}>()
</script>

<template>
    <div class="relative group">
        <div
            class="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 bg-white dark:bg-neutral-950 border-2 border-brand-600 rounded-none group-hover:bg-brand-600 transition-all"
        />
        <span class="text-xs font-mono text-brand-600 font-semibold uppercase tracking-wider">{{
            period
        }}</span>
        <h3 class="text-lg font-bold text-zinc-900 dark:text-white mt-1">{{ title }}</h3>
        <p class="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{{ organization }}</p>
        <ul
            class="mt-3 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light list-disc pl-4 space-y-1"
        >
            <li v-for="(task, idx) in responsibilities" :key="idx">{{ task }}</li>
        </ul>
    </div>
</template>
