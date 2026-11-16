<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectCategory } from '@/types'
import { skills } from '@/data/skills'
import { experience } from '@/data/experience'
import { projects } from '@/data/projects'
import { useTheme } from '@/composables/useTheme'
import { useClipboard } from '@/composables/useClipboard'
import { useProjectFilter } from '@/composables/useProjectFilter'
import { useImagePreloader } from '@/composables/useImagePreloader'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroSection from '@/components/standard/HeroSection.vue'
import AboutSection from '@/components/standard/AboutSection.vue'
import ExperienceSection from '@/components/standard/ExperienceSection.vue'
import ProjectsSection from '@/components/standard/ProjectsSection.vue'
import ContactSection from '@/components/standard/ContactSection.vue'
import ToastNotification from '@/components/shared/ToastNotification.vue'
import { email } from '@/data/constants'

const { toggleTheme } = useTheme()
const { copyBtnText, toast, copyEmailToClipboard } = useClipboard(email)
const { activeFilter, filteredProjects } = useProjectFilter(projects)

const allThumbnails = projects.flatMap((p) => p.thumbnailImages)
useImagePreloader(allThumbnails)

const mobileMenuOpen = ref(false)

const handleFilter = (category: ProjectCategory) => {
    activeFilter.value = category
}
</script>

<template>
    <div id="top" class="flex flex-col min-h-screen">
        <ToastNotification :toast="toast" />
        <AppHeader v-model:mobile-menu-open="mobileMenuOpen" @toggle-theme="toggleTheme" />

        <main class="flex-grow max-w-5xl mx-auto px-6 w-full py-12 space-y-24 md:space-y-32">
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

        <AppFooter />
    </div>
</template>
