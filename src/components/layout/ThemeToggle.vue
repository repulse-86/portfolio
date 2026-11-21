<script setup lang="ts">
defineEmits<{
    toggle: []
}>()
</script>

<template>
    <button
        class="inline-flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
        aria-label="Toggle Theme"
        @click="$emit('toggle')"
    >
        <i class="ph ph-sun text-lg leading-none hidden dark:inline" />
        <i class="ph ph-moon text-lg leading-none inline dark:hidden" />
    </button>
</template>
