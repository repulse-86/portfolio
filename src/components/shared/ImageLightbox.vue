<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type MaybeRefOrGetter, toValue } from 'vue'

interface LightboxOptions {
    preventDefault?: boolean
}

const props = defineProps<{
    images: MaybeRefOrGetter<readonly string[]>
    index: number | null
    title: string
    options?: LightboxOptions
}>()

const emit = defineEmits<{
    close: []
    prev: []
    next: []
}>()

const lightboxRef = ref<HTMLElement | null>(null)

const currentImage = computed(() => {
    const list = toValue(props.images)
    return props.index !== null ? (list[props.index] ?? null) : null
})

const total = computed(() => toValue(props.images).length)

const handleKeydown = (event: KeyboardEvent) => {
    if (props.index === null) return

    const isEscape = event.key === 'Escape'
    const isPrevious = event.key === 'ArrowLeft'
    const isNext = event.key === 'ArrowRight'
    if (!isEscape && !isPrevious && !isNext) return

    if (props.options?.preventDefault) event.preventDefault()
    if (isEscape) emit('close')
    else if (isPrevious) emit('prev')
    else emit('next')
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
})

const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === lightboxRef.value) {
        emit('close')
    }
}
</script>

<template>
    <Transition name="lightbox-fade">
        <div
            v-if="currentImage"
            ref="lightboxRef"
            class="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10"
            role="dialog"
            aria-modal="true"
            :aria-label="`${title} screenshot viewer`"
            @click="handleBackdropClick"
        >
            <button
                type="button"
                class="absolute top-4 right-4 z-10 rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:top-6 sm:right-6"
                aria-label="Close full view"
                @click="$emit('close')"
            >
                <i class="ph ph-x text-2xl" />
            </button>

            <button
                v-if="total > 1"
                type="button"
                class="absolute left-2 z-10 rounded-full bg-black/40 p-2.5 text-white/80 transition-colors hover:bg-black/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-6"
                aria-label="Previous screenshot"
                @click="$emit('prev')"
            >
                <i class="ph ph-caret-left text-2xl" />
            </button>

            <img
                :src="currentImage"
                :alt="`${title} screenshot ${(index ?? 0) + 1}`"
                class="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
                decoding="async"
            />

            <button
                v-if="total > 1"
                type="button"
                class="absolute right-2 z-10 rounded-full bg-black/40 p-2.5 text-white/80 transition-colors hover:bg-black/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-6"
                aria-label="Next screenshot"
                @click="$emit('next')"
            >
                <i class="ph ph-caret-right text-2xl" />
            </button>

            <div
                class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 font-mono text-xs text-white/80 sm:bottom-6"
            >
                {{ (index ?? 0) + 1 }} / {{ total }}
            </div>
        </div>
    </Transition>
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
