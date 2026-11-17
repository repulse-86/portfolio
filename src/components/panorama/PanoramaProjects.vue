<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Project } from '@/types'
import PanoramaProjectTile from './PanoramaProjectTile.vue'

const props = defineProps<{
    projects: Project[]
}>()

const emit = defineEmits<{
    select: [project: Project]
    widthChange: [width: number]
}>()

const GAP = 16
const COLUMNS = 5
const MOBILE_COLUMNS = 2
const PREVIOUS_COLUMNS = 6
const MAX_TILE_WIDTH = 400
const VIEWPORT_GUTTER = 64
const MOBILE_BREAKPOINT = 640
const MOBILE_WIDTH_RATIO = 0.85

const container = ref<HTMLElement | null>(null)
const containerHeight = ref(0)
const viewportWidth = ref(window.innerWidth)

let resizeObserver: ResizeObserver | null = null

const updateViewportWidth = () => {
    viewportWidth.value = window.innerWidth
}

onMounted(() => {
    updateViewportWidth()
    window.addEventListener('resize', updateViewportWidth)

    resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) containerHeight.value = entry.contentRect.height
    })

    if (container.value) resizeObserver.observe(container.value)
})

onUnmounted(() => {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', updateViewportWidth)
})

const orderedProjects = computed(() => {
    const items = props.projects
    if (items.length <= COLUMNS) return items

    const previousRows = Math.ceil(items.length / PREVIOUS_COLUMNS)
    const removedColumn = PREVIOUS_COLUMNS - 1
    const kept: Project[] = []
    const removed: Project[] = []

    for (let row = 0; row < previousRows; row++) {
        for (let column = 0; column < PREVIOUS_COLUMNS; column++) {
            const project = items[row * PREVIOUS_COLUMNS + column]
            if (!project) continue

            if (column === removedColumn) removed.push(project)
            else kept.push(project)
        }
    }

    return [...kept, ...removed]
})

const isMobile = computed(() => viewportWidth.value < MOBILE_BREAKPOINT)

const columns = computed(() => (isMobile.value ? MOBILE_COLUMNS : COLUMNS))

const gridProjects = computed(() => (isMobile.value ? props.projects : orderedProjects.value))

const rows = computed(() => Math.max(1, Math.ceil(props.projects.length / columns.value)))

const tileWidth = computed(() => {
    if (containerHeight.value <= 0) return 0

    const availableWidth = isMobile.value
        ? viewportWidth.value * MOBILE_WIDTH_RATIO
        : viewportWidth.value - VIEWPORT_GUTTER
    const maxByWidth = (availableWidth - (columns.value - 1) * GAP) / columns.value

    if (isMobile.value) return Math.max(0, Math.min(MAX_TILE_WIDTH, maxByWidth))

    const maxByHeight = (containerHeight.value - (rows.value - 1) * GAP) / (rows.value * 0.75)

    return Math.max(0, Math.min(MAX_TILE_WIDTH, maxByHeight, maxByWidth))
})

const gridWidth = computed(() => tileWidth.value * columns.value + (columns.value - 1) * GAP)

watch(gridWidth, (width) => emit('widthChange', width), { immediate: true })

const gridStyle = computed(() => {
    const size = tileWidth.value
    return {
        gridTemplateColumns: `repeat(${columns.value}, ${size}px)`,
        gridTemplateRows: `repeat(${rows.value}, ${size * 0.75}px)`,
        gap: `${GAP}px`,
        justifyContent: 'start',
    }
})
</script>

<template>
    <div
        ref="container"
        class="h-full pb-10 pt-0 sm:pt-6"
        :class="isMobile && 'overflow-y-auto overscroll-y-contain'"
        :data-panorama-vertical="isMobile ? '' : undefined"
    >
        <div class="grid" :style="gridStyle">
            <PanoramaProjectTile
                v-for="project in gridProjects"
                :key="project.id"
                :project="project"
                @select="emit('select', project)"
            />
        </div>
    </div>
</template>
