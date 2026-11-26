<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Project } from '@/types'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { paginate } from '@/utils/paginate'
import ProjectCard from './ProjectCard.vue'

const props = defineProps<{
    projects: Project[]
    revealStart?: number
}>()

const emit = defineEmits<{
    select: [project: Project]
    'page-count': [count: number]
}>()

const wide = useMediaQuery('(min-width: 640px)')

const itemsPerPage = computed(() => (wide.value ? 9 : 6))
const projectPages = computed(() => {
    const pages = paginate(props.projects, itemsPerPage.value)
    if (pages.length === 0) return [props.projects]

    if (!wide.value && pages.length > 2) {
        const [first = [], second = [], ...overflow] = pages
        return [[...first, ...overflow.flat()], second]
    }

    return pages
})

watch(projectPages, (pages) => emit('page-count', pages.length), { immediate: true })

const PAGE_STAGGER_MS = 400
const pageDelay = (index: number) => `${(props.revealStart ?? 0) + index * PAGE_STAGGER_MS}ms`
</script>

<template>
    <template v-for="(page, pageIdx) in projectPages" :key="pageIdx">
        <div
            :id="pageIdx === 0 ? 'projects' : `projects-${pageIdx + 1}`"
            class="shrink-0 snap-start flex flex-col mr-4 sm:mr-8 w-[85vw] sm:w-[50vw] h-full"
            :style="{ '--intro-delay': pageDelay(pageIdx) }"
        >
            <div class="panorama-intro-section flex flex-col h-full">
                <div class="panorama-hover-scroll flex flex-col h-full overflow-y-auto pb-8">
                    <div class="mb-4 flex items-baseline justify-between">
                        <h2
                            class="text-2xl sm:text-3xl font-normal lowercase tracking-tight"
                            :class="{ invisible: pageIdx > 0 }"
                            :aria-hidden="pageIdx > 0"
                        >
                            projects
                        </h2>
                    </div>

                    <div
                        class="flex-1 grid grid-cols-2 sm:grid-cols-3 auto-rows-min content-start gap-4"
                    >
                        <ProjectCard
                            v-for="project in page"
                            :key="project.id"
                            :project="project"
                            @select="$emit('select', project)"
                        />
                    </div>
                </div>
            </div>
        </div>
    </template>
</template>
