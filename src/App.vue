<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { ProjectCategory } from '@/types'
import { skills } from '@/data/skills'
import { experience } from '@/data/experience'
import { projects } from '@/data/projects'
import { useTheme } from '@/composables/useTheme'
import { useClipboard } from '@/composables/useClipboard'
import { useProjectFilter } from '@/composables/useProjectFilter'
import { useImagePreloader } from '@/composables/useImagePreloader'
import type { PanoramaSection } from '@/composables/usePanoramaScroll'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import PanoramaView from '@/components/panorama/PanoramaView.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import { email } from '@/data/constants'

const { darkMode, toggleTheme } = useTheme()
const { copyBtnText, toast, copyEmailToClipboard } = useClipboard(email)
const { activeFilter, filteredProjects } = useProjectFilter(projects)

const allThumbnails = projects.flatMap((p) => p.thumbnailImages)
useImagePreloader(allThumbnails)

const mobileMenuOpen = ref(false)
const panoramaMode = ref(false)
const activeSection = ref<'about' | 'projects' | 'experience' | 'contact'>('about')
const panoramaRef = ref<InstanceType<typeof PanoramaView> | null>(null)

const handleFilter = (category: ProjectCategory) => {
    activeFilter.value = category
}

const togglePanorama = () => {
    panoramaMode.value = !panoramaMode.value
}

const resetWindowScroll = () => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
}

watch(panoramaMode, () => {
    activeSection.value = 'about'
    resetWindowScroll()
    nextTick(resetWindowScroll)
})

const handleSectionClick = (section: PanoramaSection) => {
    if (!panoramaMode.value) return
    panoramaRef.value?.scrollToSection(section)
}
</script>

<template>
    <div
        id="top"
        :class="
            panoramaMode ? 'flex h-screen flex-col overflow-hidden' : 'flex min-h-screen flex-col'
        "
    >
        <ToastNotification :toast="toast" />
        <AppHeader
            v-model:mobile-menu-open="mobileMenuOpen"
            :dark-mode="darkMode"
            :panorama-mode="panoramaMode"
            :active-section="activeSection"
            @toggle-theme="toggleTheme"
            @toggle-panorama="togglePanorama"
            @section-click="handleSectionClick"
        />

        <Transition name="view">
            <main
                v-if="!panoramaMode"
                key="normal"
                class="mx-auto w-full max-w-5xl flex-grow space-y-24 px-6 py-12 md:space-y-32"
            >
                <HeroSection />
                <AboutSection :skills="skills" />
                <ExperienceSection :experience="experience" />
                <ProjectsSection
                    :projects="filteredProjects"
                    :active-filter="activeFilter"
                    @filter="handleFilter"
                />
                <ContactSection :copy-btn-text="copyBtnText" @copy="copyEmailToClipboard" />
            </main>

            <PanoramaView
                v-else
                key="panorama"
                ref="panoramaRef"
                :skills="skills"
                :experience="experience"
                :projects="projects"
                :copy-btn-text="copyBtnText"
                @copy="copyEmailToClipboard"
                @section-change="activeSection = $event"
            />
        </Transition>

        <AppFooter v-if="!panoramaMode" />
    </div>
</template>

<style scoped>
.view-enter-active,
.view-leave-active {
    transition:
        opacity 0.22s ease,
        transform 0.22s ease;
}

.view-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.view-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
