<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Experience, PanoramaSection, Project, Skill } from '@/types'
import AboutPanel from './AboutPanel.vue'
import ProjectsPanel from './ProjectsPanel.vue'
import ExperiencePanel from './ExperiencePanel.vue'
import ContactPanel from './ContactPanel.vue'
import FooterPanel from './FooterPanel.vue'
import ProjectDetail from './ProjectDetail.vue'
import { useWheelPager } from '@/composables/useWheelPager'
import { prefersReducedMotion } from '@/utils/media'
import { findNearestIndex, getSnapPoints } from '@/utils/scroll'

const props = defineProps<{
    skills: Skill[]
    experience: Experience[]
    projects: Project[]
    copyBtnText: string
}>()

const emit = defineEmits<{
    copy: []
    sectionChange: [section: PanoramaSection]
}>()

const viewport = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const currentStep = ref(0)
const selectedProject = ref<Project | null>(null)

const projectPageCount = ref(1)
const SECTION_STAGGER = 0.4
const sectionDelay = (index: number) => `${index * SECTION_STAGGER}s`

let snapPoints: number[] = []
const refreshSnapPoints = () => {
    snapPoints = getSnapPoints(viewport.value)
}
const getPoints = () => {
    if (snapPoints.length === 0) refreshSnapPoints()
    return snapPoints
}

let isProgrammaticScrollTimer: ReturnType<typeof setTimeout> | null = null
const supportsScrollEnd = typeof window !== 'undefined' && 'onscrollend' in window

const animateScrollTo = (targetX: number) => {
    if (!viewport.value) return
    const maxScroll = Math.max(0, viewport.value.scrollWidth - viewport.value.clientWidth)
    const clampedTarget = Math.max(0, Math.min(targetX, maxScroll))
    viewport.value.scrollTo({
        left: clampedTarget,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
    if (!supportsScrollEnd) {
        isProgrammaticScrollTimer = setTimeout(() => {
            isProgrammaticScrollTimer = null
        }, 300)
    }
}

const onScrollEnd = () => {
    if (isProgrammaticScrollTimer !== null) {
        clearTimeout(isProgrammaticScrollTimer)
        isProgrammaticScrollTimer = null
    }
}

const getNearestStepIndex = (scrollLeft: number): number =>
    findNearestIndex(getPoints(), scrollLeft)

const goToStep = (index: number) => {
    const points = getPoints()
    if (points.length === 0) return
    const clampedIdx = Math.max(0, Math.min(index, points.length - 1))
    currentStep.value = clampedIdx
    animateScrollTo(points[clampedIdx])
}

const scrollToSection = (sectionId: string) => {
    if (!viewport.value || !track.value) return
    const el = track.value.querySelector<HTMLElement>(`#${sectionId}`)
    if (!el) return
    const points = getPoints()
    let closestIdx = 0
    let minDiff = Infinity
    points.forEach((pt, idx) => {
        const diff = Math.abs(pt - el.offsetLeft)
        if (diff < minDiff) {
            minDiff = diff
            closestIdx = idx
        }
    })
    goToStep(closestIdx)
}

const handleScroll = () => {
    if (!viewport.value || !track.value) return
    const nearestIdx = getNearestStepIndex(viewport.value.scrollLeft)
    currentStep.value = nearestIdx

    const activeChild = track.value.children[nearestIdx] as HTMLElement
    if (activeChild && activeChild.id) {
        const rawId = activeChild.id
        const baseId = rawId.startsWith('projects') ? 'projects' : rawId
        emit('sectionChange', baseId as PanoramaSection)
    }
}

useWheelPager(viewport, (direction) => goToStep(currentStep.value + direction), {
    skipClassName: 'panorama-hover-scroll',
})

const handleResize = () => {
    refreshSnapPoints()
    goToStep(currentStep.value)
}

watch(projectPageCount, () => nextTick(refreshSnapPoints))

onMounted(() => {
    refreshSnapPoints()
    if (viewport.value) {
        viewport.value.addEventListener('scroll', handleScroll, { passive: true })
        viewport.value.addEventListener('scrollend', onScrollEnd, { passive: true })
    }
    window.addEventListener('resize', handleResize)
    nextTick(refreshSnapPoints)
})

onUnmounted(() => {
    if (isProgrammaticScrollTimer !== null) clearTimeout(isProgrammaticScrollTimer)
    if (viewport.value) {
        viewport.value.removeEventListener('scroll', handleScroll)
        viewport.value.removeEventListener('scrollend', onScrollEnd)
    }
    window.removeEventListener('resize', handleResize)
})

const openProject = (project: Project) => {
    selectedProject.value = project
}

const closeProject = () => {
    selectedProject.value = null
}

defineExpose({ scrollToSection, scrollToStep: goToStep })
</script>

<template>
    <div
        id="app"
        class="flex-1 min-h-0 w-full flex flex-col bg-white text-black overflow-hidden select-none dark:bg-zinc-950 dark:text-white"
    >
        <main
            ref="viewport"
            class="flex-1 w-full overflow-x-auto overflow-y-hidden no-scrollbar relative flex flex-col justify-between snap-x snap-mandatory scroll-pl-6 sm:scroll-pl-32"
        >
            <div
                ref="track"
                class="flex-1 flex items-stretch pt-6 pl-6 sm:pl-32 pr-[15vw] sm:pr-[50vw] w-max shrink-0 max-h-full"
            >
                <section
                    id="about"
                    class="section-reveal panorama-hover-scroll shrink-0 snap-start flex flex-col mr-4 sm:mr-8 w-[85vw] sm:w-[50vw] h-full overflow-y-auto pb-8"
                    :style="{ animationDelay: sectionDelay(0) }"
                >
                    <div class="mb-4 flex items-baseline justify-between">
                        <h2 class="text-2xl sm:text-3xl font-normal lowercase tracking-tight">
                            about
                        </h2>
                    </div>
                    <AboutPanel :skills="props.skills" @navigate="scrollToSection" />
                </section>

                <ProjectsPanel
                    :projects="props.projects"
                    :reveal-start="SECTION_STAGGER"
                    @select="openProject"
                    @page-count="projectPageCount = $event"
                />

                <section
                    id="experience"
                    class="section-reveal panorama-hover-scroll shrink-0 snap-start flex flex-col mr-4 sm:mr-8 w-[85vw] sm:w-[50vw] h-full overflow-y-auto pb-8"
                    :style="{ animationDelay: sectionDelay(1 + projectPageCount) }"
                >
                    <div class="mb-4 flex items-baseline justify-between">
                        <h2 class="text-2xl sm:text-3xl font-normal lowercase tracking-tight">
                            experience
                        </h2>
                    </div>
                    <ExperiencePanel :experience="props.experience" />
                </section>

                <section
                    id="contact"
                    class="section-reveal shrink-0 snap-start flex flex-col mr-4 sm:mr-8 w-[85vw] sm:w-[50vw] h-full overflow-y-auto"
                    :style="{ animationDelay: sectionDelay(2 + projectPageCount) }"
                >
                    <div class="mb-4 flex items-baseline justify-between">
                        <h2 class="text-2xl sm:text-3xl font-normal lowercase tracking-tight">
                            contact
                        </h2>
                    </div>
                    <ContactPanel :copy-btn-text="props.copyBtnText" @copy="emit('copy')" />
                </section>

                <section
                    id="footer"
                    class="section-reveal shrink-0 snap-start flex flex-col mr-4 sm:mr-8 w-[85vw] sm:w-[50vw] h-full overflow-hidden"
                    :style="{ animationDelay: sectionDelay(3 + projectPageCount) }"
                >
                    <FooterPanel @navigate="scrollToSection" />
                </section>
            </div>
        </main>

        <Transition name="view-slide" mode="out-in">
            <ProjectDetail
                v-if="selectedProject"
                key="detail"
                :project="selectedProject"
                @back="closeProject"
            />
        </Transition>
    </div>
</template>

<style scoped>
@media (min-width: 640px) {
    .panorama-hover-scroll {
        overflow-y: hidden;
        scrollbar-width: none;
    }

    .panorama-hover-scroll:hover {
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgb(161 161 170 / 0.6) transparent;
    }

    .panorama-hover-scroll:hover::-webkit-scrollbar {
        display: block;
        width: 8px;
    }

    .panorama-hover-scroll:hover::-webkit-scrollbar-thumb {
        background-color: rgb(161 161 170 / 0.6);
        border-radius: 9999px;
    }

    .panorama-hover-scroll:hover::-webkit-scrollbar-track {
        background-color: transparent;
    }
}
</style>
