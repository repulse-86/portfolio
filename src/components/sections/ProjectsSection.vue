<script setup lang="ts">
import { ref } from 'vue'
import type { Project, ProjectCategory } from '@/types'
import ProjectCard from '@/components/ui/ProjectCard.vue'
import ProjectModal from '@/components/ui/ProjectModal.vue'
import CategoryFilter from '@/components/ui/CategoryFilter.vue'

defineProps<{
    projects: Project[]
    activeFilter: ProjectCategory
}>()

const emit = defineEmits<{
    filter: [category: ProjectCategory]
}>()

const selectedProject = ref<Project | null>(null)

const openProject = (project: Project) => {
    selectedProject.value = project
}

const closeModal = () => {
    selectedProject.value = null
}
</script>

<template>
    <section id="projects" class="scroll-mt-24 space-y-12">
        <div
            class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-900 pb-6"
        >
            <div class="space-y-4">
                <span class="text-xs uppercase font-bold tracking-widest text-brand-600"
                    >Selected Works</span
                >
                <h2 class="text-3xl font-bold tracking-tight">Recent Projects</h2>
            </div>

            <CategoryFilter :active-filter="activeFilter" @select="emit('filter', $event)" />
        </div>

        <div class="projects">
            <ProjectCard
                v-for="project in projects"
                :id="project.id"
                :key="project.id"
                :tech-label="project.techLabel"
                :tech-stack="project.techStack"
                :title="project.title"
                :description="project.description"
                :demo-url="project.demoUrl"
                :badge-text="project.badgeText"
                :thumbnail-images="project.thumbnailImages"
                class="project"
                @click="openProject(project)"
            />
        </div>

        <ProjectModal v-if="selectedProject" :project="selectedProject" @close="closeModal" />
    </section>
</template>

<style scoped>
.projects {
    column-width: 300px;
    column-gap: 1rem;
    width: 100%;
}

.project {
    display: inline-block;
    width: 100%;
    margin-bottom: 0.5rem;
}

@media (max-width: 640px) {
    .projects {
        column-count: 1 !important;
    }
}
</style>
