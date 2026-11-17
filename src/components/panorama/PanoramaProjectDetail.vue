<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { Project } from '@/types'
import Panorama from './framework/Panorama.vue'
import PanoramaSection from './framework/PanoramaSection.vue'

const props = defineProps<{
    project: Project
}>()

const emit = defineEmits<{
    back: []
}>()

const descriptionLines = computed(() =>
    props.project.description
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
)

const shouldSplitDescription = computed(
    () => props.project.description.length > 520 && descriptionLines.value.length > 4,
)

const splitIndex = computed(() => Math.max(1, Math.ceil(descriptionLines.value.length / 2)))

const firstDescriptionHtml = computed(() =>
    shouldSplitDescription.value
        ? props.project.descriptionHtml.split('\n').slice(0, splitIndex.value).join('\n')
        : props.project.descriptionHtml,
)

const secondDescriptionHtml = computed(() =>
    props.project.descriptionHtml.split('\n').slice(splitIndex.value).join('\n'),
)

const heroImage = computed(() => props.project.images[0] ?? props.project.thumbnailImages[0])

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        event.preventDefault()
        emit('back')
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <div class="relative">
        <button
            type="button"
            class="absolute top-5 left-6 z-30 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white hover:text-zinc-950 dark:border-zinc-800 dark:bg-neutral-950/80 dark:text-zinc-300 dark:hover:bg-neutral-900 dark:hover:text-white"
            @click="emit('back')"
        >
            <i class="ph ph-arrow-left text-base" />
            Back to projects
            <kbd
                class="ml-2 hidden rounded border border-zinc-200 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400 sm:inline dark:border-zinc-700 dark:text-zinc-500"
            >
                ESC
            </kbd>
        </button>

        <Panorama class="h-[calc(100vh_-_64px)]" unit="88vw" unit-sm="65vw" gap="0rem" pad="0rem">
            <PanoramaSection id="overview" scrollable :aria-label="`${project.title} overview`">
                <div
                    class="flex min-h-full flex-col gap-8 px-8 py-20 md:px-12 lg:flex-row lg:gap-12"
                >
                    <div
                        class="flex min-h-[280px] flex-1 items-center justify-center rounded-xl bg-zinc-100/70 dark:bg-zinc-900/50"
                    >
                        <img
                            v-if="heroImage"
                            :src="heroImage"
                            :alt="`${project.title} main screenshot`"
                            class="max-h-[52vh] w-auto max-w-full rounded-lg object-contain shadow-2xl lg:max-h-[70vh]"
                        />
                    </div>

                    <div class="flex-1 space-y-5 lg:max-w-xl lg:self-center">
                        <div class="space-y-1">
                            <span
                                class="font-mono text-xs font-semibold tracking-wider text-brand-600 uppercase"
                            >
                                {{ project.techLabel }}
                            </span>
                            <h2 class="text-3xl font-bold tracking-tight md:text-4xl">
                                {{ project.title }}
                            </h2>
                        </div>

                        <div
                            class="prose prose-sm max-w-none text-sm leading-relaxed font-light text-zinc-600 prose-zinc dark:prose-invert dark:text-zinc-400 [&_li::before]:mt-0.5 [&_li::before]:shrink-0 [&_li::before]:text-brand-500 [&_li::before]:content-['•'] [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li_p]:m-0 [&_ul]:mt-2 [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:pl-0"
                            v-html="firstDescriptionHtml"
                        />

                        <div
                            class="flex flex-wrap items-center gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800"
                        >
                            <span
                                class="rounded-lg bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                            >
                                {{ project.techStack }}
                            </span>
                        </div>

                        <div class="flex items-center gap-4 pt-1">
                            <a
                                v-if="project.demoUrl"
                                :href="project.demoUrl"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                            >
                                <i class="ph ph-arrow-up-right text-base" />
                                View Live Demo
                            </a>
                            <span v-else class="text-xs font-semibold text-zinc-500">
                                {{ project.techLabel }} project
                            </span>
                        </div>
                    </div>
                </div>
            </PanoramaSection>

            <PanoramaSection
                v-if="shouldSplitDescription && secondDescriptionHtml"
                id="details"
                scrollable
                :aria-label="`${project.title} details continued`"
            >
                <div class="flex min-h-full items-center px-8 py-20 md:px-16">
                    <div class="w-full max-w-3xl space-y-6">
                        <div class="space-y-2">
                            <span
                                class="font-mono text-[10px] font-semibold tracking-[0.35em] text-zinc-400 uppercase dark:text-zinc-500"
                            >
                                Continued
                            </span>
                            <h2 class="text-2xl font-bold tracking-tight md:text-3xl">
                                {{ project.title }}
                            </h2>
                        </div>

                        <div
                            class="prose prose-sm max-w-none text-sm leading-relaxed font-light text-zinc-600 prose-zinc dark:prose-invert dark:text-zinc-400 [&_li::before]:mt-0.5 [&_li::before]:shrink-0 [&_li::before]:text-brand-500 [&_li::before]:content-['•'] [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li_p]:m-0 [&_ul]:mt-2 [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:pl-0"
                            v-html="secondDescriptionHtml"
                        />
                    </div>
                </div>
            </PanoramaSection>

            <PanoramaSection
                v-for="(image, index) in project.images"
                :id="`shot-${index + 1}`"
                :key="`${image}-${index}`"
                scrollable
                class="bg-zinc-100 p-3 pt-16 md:p-4 md:pt-20 dark:bg-neutral-900"
                :aria-label="`${project.title} screenshot ${index + 1}`"
            >
                <div class="flex flex-1 items-center justify-center">
                    <img
                        :src="image"
                        :alt="`${project.title} screenshot ${index + 1}`"
                        class="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                    />
                </div>

                <div
                    class="pointer-events-none absolute right-8 bottom-6 flex items-center gap-3 font-mono text-[10px] font-semibold tracking-[0.3em] text-zinc-400 uppercase dark:text-zinc-500"
                >
                    <span>{{ project.title }}</span>
                    <span class="h-1 w-1 rounded-full bg-brand-600" />
                    <span>{{ index + 1 }} / {{ project.images.length }}</span>
                </div>
            </PanoramaSection>
        </Panorama>
    </div>
</template>
