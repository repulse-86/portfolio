<script setup lang="ts">
defineProps<{
    copyBtnText: string
}>()

defineEmits<{
    copy: []
}>()
</script>

<template>
    <section id="contact" class="scroll-mt-24 max-w-2xl mx-auto text-center space-y-10 py-12">
        <div class="space-y-4">
            <span class="text-xs uppercase font-bold tracking-widest text-brand-600">Contact</span>
            <h2 class="text-3xl font-bold tracking-tight">Let's Connect</h2>
            <p class="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed max-w-lg mx-auto">
                Have an interesting project, position, or application layout requirement? Reach out
                instantly via email to coordinate technical solutions.
            </p>
        </div>

        <div
            class="p-6 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-xl space-y-4 shadow-sm"
        >
            <span class="text-xs font-bold text-zinc-500 uppercase tracking-wide block"
                >Contact Details</span
            >
            <div
                class="flex flex-col sm:flex-row items-center justify-between gap-4 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950"
            >
                <span class="text-sm font-mono font-medium truncate select-all"
                    >johnkenneth.ornias@gmail.com</span
                >
                <button
                    class="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-100 dark:hover:text-brand-200 transition-colors flex-shrink-0"
                    @click="$emit('copy')"
                >
                    <i class="ph ph-copy mr-1 text-base" /> <span>{{ copyBtnText }}</span>
                </button>
            </div>
        </div>

        <div class="space-y-3 pt-2">
            <h4 class="text-xs font-bold text-zinc-500 uppercase tracking-wide">
                John Kenneth B. Ornias
            </h4>
            <div class="flex justify-center gap-4">
                <a
                    href="https://github.com/repulse-86"
                    target="_blank"
                    class="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                    aria-label="GitHub Profile"
                >
                    <i class="ph ph-github-logo text-xl" />
                </a>
                <a
                    href="https://olive-partridge-593852.hostingersite.com/"
                    target="_blank"
                    class="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                    aria-label="Alternative Portfolio Link"
                >
                    <i class="ph ph-globe text-xl" />
                </a>
            </div>
        </div>
    </section>
</template>
