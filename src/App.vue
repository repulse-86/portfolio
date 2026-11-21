<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { PanoramaSection, ProjectCategory } from '@/types'
import { skills } from '@/data/skills'
import { experience } from '@/data/experience'
import { projects } from '@/data/projects'
import { useTheme } from '@/composables/useTheme'
import { useClipboard } from '@/composables/useClipboard'
import { useProjectFilter } from '@/composables/useProjectFilter'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroSection from '@/components/standard/HeroSection.vue'
import AboutSection from '@/components/standard/AboutSection.vue'
import ExperienceSection from '@/components/standard/ExperienceSection.vue'
import ProjectsSection from '@/components/standard/ProjectsSection.vue'
import ContactSection from '@/components/standard/ContactSection.vue'
import PanoramaView from '@/components/panorama/PanoramaView.vue'
import ToastNotification from '@/components/shared/ToastNotification.vue'
import { email } from '@/data/site'

const { toggleTheme } = useTheme()
const { copyBtnText, toast, copyEmailToClipboard } = useClipboard(email)
const { activeFilter, filteredProjects } = useProjectFilter(projects)

const mobileMenuOpen = ref(false)
const panoramaMode = ref(true)
const activeSection = ref<PanoramaSection>('about')
const panoramaRef = ref<InstanceType<typeof PanoramaView> | null>(null)

const handleFilter = (category: ProjectCategory) => {
    activeFilter.value = category
}

const togglePanorama = () => {
    panoramaMode.value = !panoramaMode.value
}

const resetWindowScroll = () => {
    window.scrollTo(0, 0)
}

watch(
    panoramaMode,
    (enabled) => {
        document.documentElement.classList.toggle('panorama-mode', enabled)
        activeSection.value = 'about'
        resetWindowScroll()
        nextTick(resetWindowScroll)
    },
    { immediate: true },
)

const handleSectionClick = (section: PanoramaSection) => {
    if (!panoramaMode.value) return
    panoramaRef.value?.scrollToSection(section)
}
</script>

<template>
    <div
        id="top"
        :class="
            panoramaMode ? 'flex h-dvh flex-col overflow-hidden' : 'flex min-h-screen flex-col'
        "
    >
        <ToastNotification :toast="toast" />
        <AppHeader
            v-model:mobile-menu-open="mobileMenuOpen"
            :panorama-mode="panoramaMode"
            :active-section="activeSection"
            @toggle-theme="toggleTheme"
            @toggle-panorama="togglePanorama"
            @section-click="handleSectionClick"
        />

        <Transition name="view-slide">
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
