<script setup lang="ts">
withDefaults(
    defineProps<{
        html: string
        compact?: boolean
    }>(),
    { compact: false },
)
</script>

<template>
    <div
        class="project-description"
        :class="{ 'project-description--compact': compact }"
        v-html="html"
    />
</template>
