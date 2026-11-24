<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Project } from '@/types'
import { useLightbox } from '@/composables/useLightbox'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useWheelPager } from '@/composables/useWheelPager'
import { prefersReducedMotion } from '@/utils/media'
import { paginate } from '@/utils/paginate'
import { findNearestIndex, getSnapPoints } from '@/utils/scroll'
import ProjectDescription from '@/components/shared/ProjectDescription.vue'
import ImageLightbox from '@/components/shared/ImageLightbox.vue'

const props = defineProps<{
    project: Project
}>()

const emit = defineEmits<{
    back: []
}>()

const wide = useMediaQuery('(min-width: 640px)')
const viewport = ref<HTMLElement | null>(null)
const root = ref<HTMLElement | null>(null)

const getTurnstileItems = (): HTMLElement[] => (root.value ? [root.value] : [])

defineExpose({ getTurnstileItems })

const stepSection = (direction: number) => {
    const el = viewport.value
    if (!el) return
    const points = getSnapPoints(el)
    if (points.length === 0) return

    const nearestIdx = findNearestIndex(points, el.scrollLeft)
    const targetIdx = Math.max(0, Math.min(nearestIdx + direction, points.length - 1))
    el.scrollTo({
        left: points[targetIdx],
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
}

useWheelPager(viewport, stepSection, { skipClassName: 'panorama-hover-scroll' })

const heroImage = computed(() => props.project.images[0] ?? props.project.thumbnailImages[0])

const {
    index: lightboxIndex,
    open: openLightbox,
    close: closeLightbox,
    prev: prevImage,
    next: nextImage,
    handleKeydown: handleLightboxKeydown,
} = useLightbox(() => props.project.images, { preventDefault: true })

const itemsPerPage = computed(() => (wide.value ? 9 : 6))
const galleryPages = computed(() => paginate(props.project.images, itemsPerPage.value))

const handleKeydown = (event: KeyboardEvent) => {
    if (handleLightboxKeydown(event)) return

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
    <div ref="root" class="absolute inset-0 bg-white dark:bg-zinc-950">
        <div
            ref="viewport"
            class="h-full w-full overflow-x-auto overflow-y-hidden no-scrollbar relative snap-x snap-mandatory scroll-pl-6 sm:scroll-pl-32"
        >
            <div class="flex h-full w-max items-stretch pt-6 pl-6 sm:pl-32 pr-[15vw] sm:pr-[50vw]">
                <section
                    id="overview"
                    class="panorama-hover-scroll shrink-0 snap-start flex flex-col mr-4 sm:mr-8 w-[85vw] sm:w-[50vw] h-full overflow-y-auto pb-8"
                    :aria-label="`${project.title} overview`"
                >
                    <div class="mb-4 flex items-baseline justify-between gap-4">
                        <h2 class="text-2xl sm:text-3xl font-normal lowercase tracking-tight">
                            {{ project.title }}
                        </h2>
                        <button
                            type="button"
                            class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-white hover:text-zinc-950 dark:border-zinc-800 dark:bg-neutral-950/80 dark:text-zinc-300 dark:hover:bg-neutral-900 dark:hover:text-white"
                            @click="emit('back')"
                        >
                            <i class="ph ph-arrow-left text-base" />
                            Back
                            <kbd
                                class="ml-1 hidden rounded border border-zinc-200 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400 sm:inline dark:border-zinc-700 dark:text-zinc-500"
                            >
                                ESC
                            </kbd>
                        </button>
                    </div>

                    <div class="flex flex-1 flex-col pb-8">
                        <button
                            v-if="heroImage"
                            type="button"
                            class="group relative flex w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                            :aria-label="`Open ${project.title} main screenshot in full view`"
                            @click="openLightbox(0)"
                        >
                            <img
                                :src="heroImage"
                                :alt="`${project.title} main screenshot`"
                                class="max-h-[60vh] w-auto rounded-lg object-contain object-center transition-transform duration-300 group-hover:scale-[1.01]"
                                loading="lazy"
                            />
                            <span
                                class="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                            >
                                <i class="ph ph-arrows-out-simple text-sm" />
                                Full view
                            </span>
                        </button>

                        <div class="mt-6 space-y-5">
                            <div class="space-y-1">
                                <span
                                    class="font-mono text-xs font-semibold tracking-wider text-brand-600 uppercase"
                                >
                                    {{ project.techLabel }}
                                </span>
                                <ProjectDescription
                                    :html="project.descriptionHtml"
                                    class="prose prose-sm max-w-none text-sm leading-relaxed font-light text-zinc-600 prose-zinc dark:prose-invert dark:text-zinc-400"
                                />
                            </div>

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
                </section>

                <template v-for="(page, pageIdx) in galleryPages" :key="pageIdx">
                    <section
                        :id="pageIdx === 0 ? 'gallery' : `gallery-${pageIdx + 1}`"
                        class="shrink-0 snap-start flex flex-col mr-4 sm:mr-8 w-[85vw] sm:w-[50vw] h-full overflow-y-auto"
                        :aria-label="`${project.title} gallery ${pageIdx + 1}`"
                    >
                        <div class="mb-4 flex items-baseline justify-between">
                            <h2 class="text-2xl sm:text-3xl font-normal lowercase tracking-tight">
                                {{ pageIdx === 0 ? 'gallery' : 'gallery (cont.)' }}
                            </h2>
                        </div>

                        <div
                            class="flex-1 grid grid-cols-2 sm:grid-cols-3 auto-rows-min content-start gap-4"
                        >
                            <button
                                v-for="(image, index) in page"
                                :key="`${image}-${index}`"
                                type="button"
                                class="group relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-zinc-800 dark:bg-zinc-900"
                                :aria-label="`Open ${project.title} screenshot ${pageIdx * itemsPerPage + index + 1} in full view`"
                                @click="openLightbox(pageIdx * itemsPerPage + index)"
                            >
                                <img
                                    :src="image"
                                    :alt="`${project.title} screenshot ${pageIdx * itemsPerPage + index + 1}`"
                                    class="aspect-[4/3] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                                    loading="lazy"
                                />
                                <span
                                    class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all duration-200 group-hover:bg-black/25 group-hover:opacity-100 group-focus-visible:bg-black/25 group-focus-visible:opacity-100"
                                >
                                    <i class="ph ph-magnifying-glass-plus text-2xl" />
                                </span>
                            </button>
                        </div>
                    </section>
                </template>
            </div>
        </div>

        <ImageLightbox
            :images="project.images"
            :index="lightboxIndex"
            :title="project.title"
            :options="{ preventDefault: true }"
            @close="closeLightbox"
            @prev="prevImage"
            @next="nextImage"
        />
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
