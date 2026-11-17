<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Experience, Project, Skill } from '@/types'
import PanoramaIntro from './PanoramaIntro.vue'
import PanoramaProjects from './PanoramaProjects.vue'
import PanoramaExperience from './PanoramaExperience.vue'
import PanoramaContact from './PanoramaContact.vue'
import PanoramaProjectDetail from './PanoramaProjectDetail.vue'

const props = defineProps<{
    skills: Skill[]
    experience: Experience[]
    projects: Project[]
    copyBtnText: string
}>()

const emit = defineEmits<{
    copy: []
    sectionChange: [section: 'about' | 'projects' | 'experience' | 'contact']
}>()

const viewport = ref<HTMLElement | null>(null)
const selectedProject = ref<Project | null>(null)

const windowWidth = ref(window.innerWidth)
const projectsWidth = ref(0)

interface SectionConfig {
    id: string
    title: string
    isWide: boolean
    vertical?: boolean
    span?: number
    widthVw?: number
    component: 'intro' | 'projects' | 'experience' | 'contact'
}

const sections = computed<SectionConfig[]>(() => [
    { id: 'about', title: 'about', isWide: false, vertical: true, component: 'intro' },
    {
        id: 'projects',
        title: 'projects',
        isWide: true,
        span: 2,
        widthVw: 85,
        component: 'projects',
    },
    {
        id: 'experience',
        title: 'experience',
        isWide: false,
        vertical: true,
        component: 'experience',
    },
    { id: 'contact', title: 'contact', isWide: false, component: 'contact' },
])

const VERTICAL_PANEL_SELECTOR = '[data-panorama-vertical]'

const MOBILE_BREAKPOINT = 640
const MOBILE_SECTION_WIDTH_VW = 85

const getSectionWidthVw = (section: SectionConfig) => {
    if (windowWidth.value < MOBILE_BREAKPOINT) return MOBILE_SECTION_WIDTH_VW
    return section.widthVw ?? (section.isWide ? (section.span || 2) * 50 : 50)
}

const getSectionWidthPx = (section: SectionConfig) => {
    if (section.component === 'projects' && projectsWidth.value > 0) return projectsWidth.value
    return (getSectionWidthVw(section) * windowWidth.value) / 100
}

const getSectionWidthStyle = (section: SectionConfig) => ({
    width:
        section.component === 'projects' && projectsWidth.value > 0
            ? `${projectsWidth.value}px`
            : `${getSectionWidthVw(section)}vw`,
})

const SECTION_GAP_MOBILE = 16
const SECTION_GAP_DESKTOP = 64

const sectionGap = computed(() =>
    windowWidth.value < MOBILE_BREAKPOINT ? SECTION_GAP_MOBILE : SECTION_GAP_DESKTOP,
)

const snapPoints = computed(() => {
    const points: { label: string; offset: number; section: string; subIndex?: number }[] = []
    let currentOffset = 0

    sections.value.forEach((sec) => {
        const sectionWidth = getSectionWidthPx(sec)

        if (!sec.isWide) {
            points.push({ label: sec.title, offset: currentOffset, section: sec.id })
            currentOffset += sectionWidth + sectionGap.value
        } else {
            const count = sec.span || 2
            const step = sectionWidth / count
            for (let idx = 0; idx < count; idx++) {
                const isExperienceAnchor = idx === count - 1
                points.push({
                    label: isExperienceAnchor ? 'experience' : `${sec.title} (${idx + 1}/${count})`,
                    offset: currentOffset + idx * step,
                    section: isExperienceAnchor ? 'experience' : sec.id,
                    subIndex: idx,
                })
            }
            currentOffset += sectionWidth + sectionGap.value
        }
    })

    return points
})

const scrollX = ref(0)
const currentSnapIndex = ref(0)

const FIXED_WHEEL_STEP = 55
const SNAP_DURATION_MS = 240
const SNAP_IDLE_DELAY_MS = 320

let isDragging = false
let startX = 0
let startScrollLeft = 0
let snapAnimFrame: number | null = null
let snapIdleTimer: ReturnType<typeof setTimeout> | null = null

const cancelSnapAnimation = () => {
    if (snapAnimFrame !== null) {
        cancelAnimationFrame(snapAnimFrame)
        snapAnimFrame = null
    }
    if (snapIdleTimer !== null) {
        clearTimeout(snapIdleTimer)
        snapIdleTimer = null
    }
}

const animateScrollTo = (targetX: number) => {
    const el = viewport.value
    if (!el) return
    cancelSnapAnimation()

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
    const target = Math.max(0, Math.min(targetX, maxScroll))

    const startPos = el.scrollLeft
    const distance = target - startPos
    if (Math.abs(distance) < 1) {
        el.scrollLeft = target
        scrollX.value = target
        return
    }

    const startTime = performance.now()

    const step = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / SNAP_DURATION_MS, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        const nextPos = startPos + distance * ease
        el.scrollLeft = nextPos
        scrollX.value = nextPos

        if (progress < 1) {
            snapAnimFrame = requestAnimationFrame(step)
        } else {
            el.scrollLeft = target
            scrollX.value = target
            snapAnimFrame = null
        }
    }

    snapAnimFrame = requestAnimationFrame(step)
}

const snapToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, snapPoints.value.length - 1))
    currentSnapIndex.value = clampedIndex
    const targetOffset = snapPoints.value[clampedIndex].offset
    animateScrollTo(targetOffset)
}

const getMaxScroll = () => {
    const el = viewport.value
    if (!el) return Infinity
    return Math.max(0, el.scrollWidth - el.clientWidth)
}

const getNearestSnapIndex = (pos: number) => {
    const points = snapPoints.value
    const maxScroll = getMaxScroll()
    let closestIdx = 0
    let minDiff = Infinity
    points.forEach((pt, idx) => {
        const offset = Math.min(pt.offset, maxScroll)
        const diff = Math.abs(pos - offset)
        if (diff < minDiff) {
            minDiff = diff
            closestIdx = idx
        }
    })
    return closestIdx
}

const updateActiveIndicator = (pos: number) => {
    currentSnapIndex.value = getNearestSnapIndex(pos)
    const section = snapPoints.value[currentSnapIndex.value]?.section
    if (section) emit('sectionChange', section as 'about' | 'projects' | 'experience' | 'contact')
}

const scheduleSnapToNearest = () => {
    if (snapIdleTimer !== null) clearTimeout(snapIdleTimer)
    snapIdleTimer = setTimeout(() => {
        if (isDragging || snapAnimFrame !== null || !viewport.value) return
        const nearestIdx = getNearestSnapIndex(viewport.value.scrollLeft)
        snapToIndex(nearestIdx)
    }, SNAP_IDLE_DELAY_MS)
}

const startDrag = (e: MouseEvent) => {
    cancelSnapAnimation()
    isDragging = true
    startX = e.pageX
    startScrollLeft = viewport.value?.scrollLeft ?? 0
}

const onDrag = (e: MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const walk = e.pageX - startX
    viewport.value!.scrollLeft = startScrollLeft - walk
    scrollX.value = viewport.value!.scrollLeft
}

const endDrag = () => {
    if (!isDragging) return
    isDragging = false
    scheduleSnapToNearest()
}

const startTouch = (e: TouchEvent) => {
    cancelSnapAnimation()
    isDragging = true
    startX = e.touches[0].pageX
    startScrollLeft = viewport.value?.scrollLeft ?? 0
}

const onTouch = (e: TouchEvent) => {
    if (!isDragging) return
    const walk = e.touches[0].pageX - startX
    viewport.value!.scrollLeft = startScrollLeft - walk
    scrollX.value = viewport.value!.scrollLeft
}

const endTouch = () => {
    if (!isDragging) return
    isDragging = false
    scheduleSnapToNearest()
}

const getVerticalPanel = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return null
    return target.closest<HTMLElement>(VERTICAL_PANEL_SELECTOR)
}

const getWheelDelta = (e: WheelEvent, el: HTMLElement) => {
    if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) return e.deltaY * 16
    if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) return e.deltaY * el.clientHeight
    return e.deltaY
}

const onWheel = (e: WheelEvent) => {
    const el = viewport.value
    if (!el) return

    const verticalPanel = getVerticalPanel(e.target)
    if (verticalPanel && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        e.preventDefault()
        cancelSnapAnimation()
        verticalPanel.scrollTop += getWheelDelta(e, verticalPanel)
        return
    }

    e.preventDefault()
    cancelSnapAnimation()

    const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (rawDelta === 0) return

    const direction = Math.sign(rawDelta)
    el.scrollLeft += direction * FIXED_WHEEL_STEP
    scrollX.value = el.scrollLeft
    scheduleSnapToNearest()
}

const handleScroll = () => {
    if (!viewport.value) return
    scrollX.value = viewport.value.scrollLeft
    updateActiveIndicator(scrollX.value)
}

const handleResize = () => {
    windowWidth.value = window.innerWidth
}

onMounted(() => {
    if (viewport.value) {
        viewport.value.addEventListener('scroll', handleScroll, { passive: true })
    }
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    cancelSnapAnimation()
    if (viewport.value) {
        viewport.value.removeEventListener('scroll', handleScroll)
    }
    window.removeEventListener('resize', handleResize)
})

const navigateToSection = (section: 'about' | 'projects' | 'experience' | 'contact') => {
    const idx = snapPoints.value.findIndex((p) => p.section === section)
    if (idx >= 0) snapToIndex(idx)
}

const openProject = (project: Project) => {
    selectedProject.value = project
}

const closeProject = () => {
    selectedProject.value = null
}

defineExpose({ scrollToSection: navigateToSection })
</script>

<template>
    <div
        id="app"
        class="h-screen w-screen flex flex-col bg-white text-black overflow-hidden select-none dark:bg-zinc-950 dark:text-white"
    >
        <main
            ref="viewport"
            class="flex-1 min-h-0 w-full overflow-x-auto no-scrollbar relative cursor-grab active:cursor-grabbing flex flex-col justify-between"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            @touchstart.passive="startTouch"
            @touchmove.passive="onTouch"
            @touchend="endTouch"
            @wheel="onWheel"
        >
            <div class="flex-1 min-h-0 flex items-stretch pt-6 pb-8 pl-6 sm:pl-32">
                <section
                    v-for="section in sections"
                    :id="section.id"
                    :key="section.id"
                    class="flex-none flex flex-col mr-4 sm:mr-16"
                    :style="getSectionWidthStyle(section)"
                >
                    <div class="mb-4 flex items-baseline justify-between">
                        <h2 class="text-2xl sm:text-3xl font-normal lowercase tracking-tight">
                            {{ section.title }}
                        </h2>
                    </div>

                    <div
                        v-if="!section.isWide"
                        class="flex-1"
                        :class="section.vertical && 'min-h-0 overflow-y-auto overscroll-y-contain'"
                        :data-panorama-vertical="section.vertical ? '' : undefined"
                    >
                        <PanoramaIntro
                            v-if="section.component === 'intro'"
                            :skills="props.skills"
                            @navigate="navigateToSection"
                        />
                        <PanoramaProjects
                            v-else-if="section.component === 'projects'"
                            :projects="props.projects"
                            @select="openProject"
                            @width-change="projectsWidth = $event"
                        />
                        <PanoramaExperience
                            v-else-if="section.component === 'experience'"
                            :experience="props.experience"
                        />
                        <PanoramaContact
                            v-else-if="section.component === 'contact'"
                            :copy-btn-text="props.copyBtnText"
                            @copy="emit('copy')"
                        />
                    </div>

                    <div v-else class="flex-1 min-h-0">
                        <PanoramaIntro
                            v-if="section.component === 'intro'"
                            :skills="props.skills"
                            @navigate="navigateToSection"
                        />
                        <PanoramaProjects
                            v-else-if="section.component === 'projects'"
                            :projects="props.projects"
                            @select="openProject"
                            @width-change="projectsWidth = $event"
                        />
                        <PanoramaExperience
                            v-else-if="section.component === 'experience'"
                            :experience="props.experience"
                        />
                        <PanoramaContact
                            v-else-if="section.component === 'contact'"
                            :copy-btn-text="props.copyBtnText"
                            @copy="emit('copy')"
                        />
                    </div>
                </section>
            </div>
        </main>

        <Transition name="panorama-swap" mode="out-in">
            <PanoramaProjectDetail
                v-if="selectedProject"
                key="detail"
                :project="selectedProject"
                @back="closeProject"
            />
        </Transition>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.panorama-swap-enter-active,
.panorama-swap-leave-active {
    transition:
        opacity 0.22s ease,
        transform 0.22s ease;
}

.panorama-swap-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.panorama-swap-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
