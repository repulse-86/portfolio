<script setup lang="ts">
defineProps<{
    panoramaMode: boolean
}>()

defineEmits<{
    toggle: []
}>()
</script>

<template>
    <button
        type="button"
        class="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
        :aria-pressed="panoramaMode"
        :aria-label="panoramaMode ? 'Exit panorama mode' : 'Enter panorama mode'"
        :title="panoramaMode ? 'Exit panorama mode' : 'Panorama mode'"
        @click="$emit('toggle')"
    >
        <i class="ph ph-rows text-lg" :class="panoramaMode ? 'inline' : 'hidden'" />
        <i class="ph ph-columns text-lg" :class="panoramaMode ? 'hidden' : 'inline'" />
    </button>
</template>
