<script setup lang="ts">
defineProps<{
    id: string
    techLabel: string
    techStack: string
    title: string
    description: string
    demoUrl?: string
    badgeText?: string
    thumbnailImages: string[]
}>()

defineEmits<{
    click: []
}>()
</script>

<template>
    <div
        class="project-card group bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-700 cursor-pointer"
        @click="$emit('click')"
    >
        <div
            class="relative h-44 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-900 overflow-hidden"
        >
            <img
                v-if="thumbnailImages.length"
                :src="thumbnailImages[0]"
                :alt="`${title} preview`"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div
                v-else
                class="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"
            />
        </div>
        <div class="p-6 flex flex-col flex-grow">
            <div
                class="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-brand-600 mb-2"
            >
                <span>{{ techLabel }}</span>
            </div>
            <h3
                class="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-100 transition-colors"
            >
                {{ title }}
            </h3>
            <p
                class="text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed flex-grow"
            >
                {{ description }}
            </p>
            <div
                class="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-6 text-xs text-zinc-600 dark:text-zinc-400 font-semibold"
            >
                <span class="text-zinc-400 font-mono text-[10px]">{{ techStack }}</span>
                <span class="flex items-center text-brand-600 dark:text-brand-100">
                    View Details <i class="ph ph-arrow-right ml-1" />
                </span>
            </div>
        </div>
    </div>
</template>
