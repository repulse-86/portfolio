<script setup lang="ts">
defineProps<{
    category: string
    technologies: string
}>()
</script>

<template>
    <div
        class="p-4 rounded-lg border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/40"
    >
        <span class="text-xs font-mono font-bold text-brand-600 uppercase">{{ category }}</span>
        <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-2">{{ technologies }}</p>
    </div>
</template>
