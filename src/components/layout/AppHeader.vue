<script setup lang="ts">
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

defineProps<{
    darkMode: boolean
}>()

defineEmits<{
    toggleTheme: []
}>()

const mobileMenuOpen = defineModel<boolean>('mobileMenuOpen', { default: false })

const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
]
</script>

<template>
    <header
        class="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 dark:bg-neutral-950/90 dark:border-zinc-900 backdrop-blur-md"
    >
        <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="#" class="text-lg font-bold tracking-tight flex items-center space-x-2">
                <span class="w-3 h-3 bg-brand-600 rounded-none inline-block" />
                <span>jornias.dev</span>
            </a>

            <nav class="hidden md:flex items-center space-x-8 text-sm font-medium">
                <a
                    v-for="link in navLinks"
                    :key="link.href"
                    :href="link.href"
                    class="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                    {{ link.label }}
                </a>
            </nav>

            <div class="flex items-center space-x-4">
                <ThemeToggle :dark-mode="darkMode" @toggle="$emit('toggleTheme')" />
                <button
                    class="md:hidden p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                    aria-label="Open Menu"
                    @click="mobileMenuOpen = !mobileMenuOpen"
                >
                    <i :class="['ph', mobileMenuOpen ? 'ph-x' : 'ph-list', 'text-lg']" />
                </button>
            </div>
        </div>

        <div
            v-show="mobileMenuOpen"
            class="md:hidden border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-neutral-950 px-6 py-4 space-y-3"
        >
            <a
                v-for="link in navLinks"
                :key="link.href"
                :href="link.href"
                class="block py-2 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white font-medium"
                @click="mobileMenuOpen = false"
            >
                {{ link.label }}
            </a>
        </div>
    </header>
</template>
