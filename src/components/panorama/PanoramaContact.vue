<script setup lang="ts">
defineProps<{
    copyBtnText: string
}>()

defineEmits<{
    copy: []
}>()
</script>

<template>
    <div class="flex h-full flex-col pt-0 pb-10 sm:pt-6">
        <div class="max-w-xl space-y-3">
            <span class="text-xs font-bold tracking-widest text-brand-600 uppercase">Contact</span>
            <h2 class="text-2xl font-bold tracking-tight">Let's Connect</h2>
            <p class="max-w-sm text-sm leading-relaxed font-light text-zinc-600 dark:text-zinc-400">
                Have an interesting project, position, or application layout requirement? Reach out
                instantly via email to coordinate technical solutions.
            </p>
        </div>

        <div
            class="mt-8 max-w-xl space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-900 dark:bg-zinc-900/30"
        >
            <span class="block text-xs font-bold tracking-wide text-zinc-500 uppercase"
                >Contact Details</span
            >
            <div
                class="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950"
            >
                <a
                    href="mailto:johnkenneth.ornias@gmail.com"
                    class="truncate font-mono text-sm font-medium hover:text-brand-600 dark:hover:text-brand-100 transition-colors"
                    >johnkenneth.ornias@gmail.com</a
                >
                <button
                    type="button"
                    class="inline-flex flex-shrink-0 items-center text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-100 dark:hover:text-brand-200"
                    @click="$emit('copy')"
                >
                    <i class="ph ph-copy mr-1 text-base" /> <span>{{ copyBtnText }}</span>
                </button>
            </div>
        </div>

        <div class="mt-auto flex max-w-xl flex-wrap items-center justify-between gap-4 pt-8">
            <h4 class="text-xs font-bold tracking-wide text-zinc-500 uppercase">
                John Kenneth B. Ornias
            </h4>
            <div class="flex gap-3">
                <a
                    href="https://github.com/repulse-86"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded-lg border border-zinc-200 p-2.5 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    aria-label="GitHub Profile"
                >
                    <i class="ph ph-github-logo text-xl" />
                </a>
                <a
                    href="https://nextcall-iedp.onrender.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded-lg border border-zinc-200 p-2.5 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    aria-label="NextCall Live Demo"
                >
                    <i class="ph ph-globe text-xl" />
                </a>
            </div>
        </div>
    </div>
</template>
