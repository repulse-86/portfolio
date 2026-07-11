<script setup lang="ts">
defineProps<{
    darkMode: boolean
}>()

defineEmits<{
    toggle: []
}>()
</script>

<template>
    <button
        class="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
        aria-label="Toggle Theme"
        @click="$emit('toggle')"
    >
        <i v-if="darkMode" class="ph ph-sun text-lg" />
        <i v-else class="ph ph-moon text-lg" />
    </button>
</template>
