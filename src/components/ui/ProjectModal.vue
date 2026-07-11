<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Project } from '@/types'

const props = defineProps<{
    project: Project
}>()

const emit = defineEmits<{
    close: []
}>()

const lightboxIndex = ref<number | null>(null)

const lightboxImage = computed(() =>
    lightboxIndex.value !== null ? props.project.images[lightboxIndex.value] : null,
)

const openLightbox = (index: number) => {
    lightboxIndex.value = index
}

const closeLightbox = () => {
    lightboxIndex.value = null
}

const prevImage = () => {
    if (lightboxIndex.value === null) return
    lightboxIndex.value =
        lightboxIndex.value > 0 ? lightboxIndex.value - 1 : props.project.images.length - 1
}

const nextImage = () => {
    if (lightboxIndex.value === null) return
    lightboxIndex.value =
        lightboxIndex.value < props.project.images.length - 1 ? lightboxIndex.value + 1 : 0
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        if (lightboxIndex.value !== null) {
            closeLightbox()
        } else {
            emit('close')
        }
    }
    if (lightboxIndex.value !== null) {
        if (e.key === 'ArrowLeft') prevImage()
        if (e.key === 'ArrowRight') nextImage()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
})
</script>

<template>
    <Teleport to="body">
        <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            @click.self="emit('close')"
        >
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />

            <div
                :class="[
                    'relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden',
                    project.thumbnailImages.length === 1
                        ? 'max-w-2xl flex flex-col'
                        : 'max-w-5xl flex flex-col md:flex-row',
                ]"
            >
                <button
                    class="absolute top-4 right-4 z-10 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    @click="emit('close')"
                >
                    <i class="ph ph-x text-lg" />
                </button>

                <div
                    v-if="project.thumbnailImages.length === 1"
                    class="flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4"
                >
                    <button
                        class="overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-600 rounded-md"
                        @click="openLightbox(0)"
                    >
                        <img
                            :src="project.thumbnailImages[0]"
                            :alt="`${project.title} screenshot`"
                            class="rounded-md hover:opacity-90 transition-opacity duration-300"
                        />
                    </button>
                </div>

                <div
                    v-else-if="project.thumbnailImages.length"
                    class="md:w-1/2 bg-zinc-100 dark:bg-zinc-900 overflow-y-auto"
                >
                    <div class="grid grid-cols-2 gap-1.5 p-1.5">
                        <button
                            v-for="(img, idx) in project.thumbnailImages"
                            :key="idx"
                            class="overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-600 rounded-md"
                            @click="openLightbox(idx)"
                        >
                            <img
                                :src="img"
                                :alt="`${project.title} screenshot ${idx + 1}`"
                                class="w-full h-32 sm:h-36 object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </button>
                    </div>
                </div>

                <div
                    :class="
                        [project.thumbnailImages.length === 1 ? '' : 'md:w-1/2'] +
                        ' p-6 sm:p-8 space-y-4 overflow-y-auto'
                    "
                >
                    <div class="space-y-1">
                        <span
                            class="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600"
                        >
                            {{ project.techLabel }}
                        </span>
                        <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">
                            {{ project.title }}
                        </h2>
                    </div>

                    <p class="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                        {{ project.description }}
                    </p>

                    <div
                        class="flex items-center gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800"
                    >
                        <span
                            class="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg"
                        >
                            {{ project.techStack }}
                        </span>
                    </div>

                    <div class="flex items-center gap-4 pt-2">
                        <a
                            v-if="project.demoUrl"
                            :href="project.demoUrl"
                            target="_blank"
                            class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <i class="ph ph-arrow-up-right text-base" />
                            View Live Demo
                        </a>
                        <span v-else class="text-xs font-semibold text-zinc-500">
                            {{ project.badgeText }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div
                v-if="lightboxImage"
                class="fixed inset-0 z-[60] flex items-center justify-center p-4"
                @click.self="closeLightbox"
            >
                <div class="absolute inset-0 bg-black/80" @click="closeLightbox" />

                <div class="relative max-w-5xl w-full flex items-center justify-center">
                    <button
                        class="absolute left-0 -translate-x-full mr-4 p-3 text-white/60 hover:text-white transition-colors"
                        @click="prevImage"
                    >
                        <i class="ph ph-caret-left text-3xl" />
                    </button>

                    <div class="relative">
                        <button
                            class="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
                            @click="closeLightbox"
                        >
                            <i class="ph ph-x text-2xl" />
                        </button>
                        <img
                            :src="lightboxImage"
                            :alt="`${project.title} screenshot ${(lightboxIndex ?? 0) + 1}`"
                            class="max-h-[80vh] max-w-full rounded-lg shadow-2xl object-contain"
                        />
                        <div
                            class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-mono"
                        >
                            {{ (lightboxIndex ?? 0) + 1 }} / {{ project.images.length }}
                        </div>
                    </div>

                    <button
                        class="absolute right-0 translate-x-full ml-4 p-3 text-white/60 hover:text-white transition-colors"
                        @click="nextImage"
                    >
                        <i class="ph ph-caret-right text-3xl" />
                    </button>
                </div>
            </div>
        </Teleport>
    </Teleport>
</template>
