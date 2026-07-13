<script setup lang="ts">
import type { ProjectCategory } from '@/types'

defineProps<{
    activeFilter: ProjectCategory
}>()

const emit = defineEmits<{
    select: [category: ProjectCategory]
}>()

const categories: { label: string; value: ProjectCategory }[] = [
    { label: 'All Projects', value: 'all' },
    { label: 'Systems', value: 'systems' },
    { label: 'Personal', value: 'personal' },
]
</script>

<template>
    <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        <button
            v-for="cat in categories"
            :key="cat.value"
            :class="[
                'px-4 py-2 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap',
                activeFilter === cat.value
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-neutral-950 border-zinc-900 dark:border-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border-transparent hover:border-zinc-300 dark:hover:border-zinc-800',
            ]"
            @click="emit('select', cat.value)"
        >
            {{ cat.label }}
        </button>
    </div>
</template>
