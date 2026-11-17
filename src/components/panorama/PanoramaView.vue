<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Experience, Project, Skill } from '@/types'
import Panorama from './framework/Panorama.vue'
import PanoramaSection from './framework/PanoramaSection.vue'
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

type SectionId = 'about' | 'projects' | 'experience' | 'contact'

const emit = defineEmits<{
    copy: []
    sectionChange: [section: SectionId]
}>()

const panorama = ref<InstanceType<typeof Panorama> | null>(null)
const selectedProject = ref<Project | null>(null)

const sections = computed(() => [
    { id: 'about' as const, title: 'about', span: 1, vertical: true, component: 'intro' as const },
    {
        id: 'projects' as const,
        title: 'projects',
        span: 2,
        vertical: false,
        component: 'projects' as const,
    },
    {
        id: 'experience' as const,
        title: 'experience',
        span: 1,
        vertical: true,
        component: 'experience' as const,
    },
    {
        id: 'contact' as const,
        title: 'contact',
        span: 1,
        vertical: false,
        component: 'contact' as const,
    },
])

/**
 * Section -> stop. `experience` leads by one stop so the projects section stays
 * partly visible; that used to be a hand-placed anchor inside the wide section.
 */
const navigateToSection = (section: SectionId) => {
    panorama.value?.scrollToSection(section, { lead: section === 'experience' ? 1 : 0 })
}

const onSectionChange = (id: string) => emit('sectionChange', id as SectionId)

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
        <Panorama ref="panorama" class="flex-1 min-h-0 w-full" @section-change="onSectionChange">
            <PanoramaSection
                v-for="section in sections"
                :id="section.id"
                :key="section.id"
                :span="section.span"
                :scrollable="section.vertical"
            >
                <template #header>
                    <div class="mb-4 flex items-baseline justify-between">
                        <h2 class="text-2xl sm:text-3xl font-normal lowercase tracking-tight">
                            {{ section.title }}
                        </h2>
                    </div>
                </template>

                <PanoramaIntro
                    v-if="section.component === 'intro'"
                    :skills="props.skills"
                    @navigate="navigateToSection"
                />
                <PanoramaProjects
                    v-else-if="section.component === 'projects'"
                    :projects="props.projects"
                    @select="openProject"
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
            </PanoramaSection>
        </Panorama>

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
/* Vertical breathing room for the track; the horizontal rhythm is the framework's. */
:deep(.pano-inner) {
    padding-top: 1.5rem;
    padding-bottom: 2rem;
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
