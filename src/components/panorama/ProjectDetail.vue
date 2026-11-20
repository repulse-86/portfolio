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

const props = defineProps<{
    project: Project
}>()

const emit = defineEmits<{
    back: []
}>()

const wide = useMediaQuery('(min-width: 640px)')
const viewport = ref<HTMLElement | null>(null)

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

useWheelPager(viewport, stepSection)

const heroImage = computed(() => props.project.images[0] ?? props.project.thumbnailImages[0])

const {
    index: lightboxIndex,
    current: lightboxImage,
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
    <div class="relative h-full bg-white dark:bg-zinc-950">
        <div
            ref="viewport"
            class="h-full w-full overflow-x-auto overflow-y-hidden no-scrollbar relative snap-x snap-mandatory scroll-pl-6 sm:scroll-pl-32"
        >
            <div class="flex h-full w-max items-stretch pt-6 pl-6 sm:pl-32 pr-[15vw] sm:pr-[50vw]">
                <section
                    id="overview"
                    class="shrink-0 snap-start flex flex-col mr-4 sm:mr-8 w-[85vw] sm:w-[50vw] h-full overflow-y-auto"
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
                            class="group relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-900"
                            :aria-label="`Open ${project.title} main screenshot in full view`"
                            @click="openLightbox(0)"
                        >
                            <img
                                :src="heroImage"
                                :alt="`${project.title} main screenshot`"
                                class="max-h-full max-w-full rounded-lg object-contain object-center transition-transform duration-300 group-hover:scale-[1.01]"
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

        <Teleport to="body">
            <Transition name="lightbox-fade">
                <div
                    v-if="lightboxImage"
                    class="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10"
                    role="dialog"
                    aria-modal="true"
                    :aria-label="`${project.title} screenshot viewer`"
                    @click.self="closeLightbox"
                >
                    <button
                        type="button"
                        class="absolute top-4 right-4 z-10 rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:top-6 sm:right-6"
                        aria-label="Close full view"
                        @click="closeLightbox"
                    >
                        <i class="ph ph-x text-2xl" />
                    </button>

                    <button
                        v-if="project.images.length > 1"
                        type="button"
                        class="absolute left-2 z-10 rounded-full bg-black/40 p-2.5 text-white/80 transition-colors hover:bg-black/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-6"
                        aria-label="Previous screenshot"
                        @click="prevImage"
                    >
                        <i class="ph ph-caret-left text-2xl" />
                    </button>

                    <img
                        :src="lightboxImage"
                        :alt="`${project.title} screenshot ${(lightboxIndex ?? 0) + 1}`"
                        class="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
                        decoding="async"
                    />

                    <button
                        v-if="project.images.length > 1"
                        type="button"
                        class="absolute right-2 z-10 rounded-full bg-black/40 p-2.5 text-white/80 transition-colors hover:bg-black/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-6"
                        aria-label="Next screenshot"
                        @click="nextImage"
                    >
                        <i class="ph ph-caret-right text-2xl" />
                    </button>

                    <div
                        class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 font-mono text-xs text-white/80 sm:bottom-6"
                    >
                        {{ (lightboxIndex ?? 0) + 1 }} / {{ project.images.length }}
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
    transition: opacity 0.2s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
    opacity: 0;
}
</style>
