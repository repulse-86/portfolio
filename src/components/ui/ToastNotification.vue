<script setup lang="ts">
import type { ToastState } from '@/types'

defineProps<{
    toast: ToastState
}>()
</script>

<template>
    <div
        class="fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none"
        :class="[toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0']"
    >
        <div
            class="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-5 py-3 rounded-lg shadow-lg flex items-center space-x-3 border border-zinc-800 dark:border-zinc-200"
        >
            <i
                :class="[
                    'ph',
                    toast.isError
                        ? 'ph-warning-circle text-rose-500'
                        : 'ph-check-circle text-emerald-500',
                    'text-lg',
                ]"
            />
            <span class="text-sm font-medium">{{ toast.message }}</span>
        </div>
    </div>
</template>
