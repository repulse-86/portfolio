import { ref, computed } from 'vue'
import type { Project, ProjectCategory } from '@/types'

export function useProjectFilter(projects: Project[]) {
    const activeFilter = ref<ProjectCategory>('all')

    const filteredProjects = computed(() => {
        if (activeFilter.value === 'all') return projects
        return projects.filter((p) => p.category === activeFilter.value)
    })

    return { activeFilter, filteredProjects }
}
