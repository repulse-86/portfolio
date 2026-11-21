<script setup lang="ts">
import { computed } from 'vue'
import ThemeToggle from '@/components/layout/ThemeToggle.vue'
import ViewToggle from '@/components/layout/ViewToggle.vue'
import type { PanoramaSection } from '@/types'

const props = defineProps<{
    panoramaMode?: boolean
    activeSection?: PanoramaSection
}>()

const emit = defineEmits<{
    toggleTheme: []
    togglePanorama: []
    sectionClick: [section: PanoramaSection]
}>()

const mobileMenuOpen = defineModel<boolean>('mobileMenuOpen', { default: false })

interface NavLink {
    label: string
    section: PanoramaSection
    href: string
}

const navLinks = computed<NavLink[]>(() => {
    const about: NavLink = { label: 'About', section: 'about', href: '#about' }
    const projects: NavLink = { label: 'Projects', section: 'projects', href: '#projects' }
    const experience: NavLink = {
        label: 'Experience',
        section: 'experience',
        href: '#experience',
    }
    const contact: NavLink = { label: 'Contact', section: 'contact', href: '#contact' }

    return props.panoramaMode
        ? [about, projects, experience, contact]
        : [about, experience, projects, contact]
})

const isActive = (link: NavLink) =>
    Boolean(props.panoramaMode) && props.activeSection === link.section

const handleNavClick = (link: NavLink, event: MouseEvent) => {
    mobileMenuOpen.value = false
    if (!props.panoramaMode) return

    event.preventDefault()
    emit('sectionClick', link.section)
}

const handleBrandClick = (event: MouseEvent) => {
    mobileMenuOpen.value = false
    if (!props.panoramaMode) return

    event.preventDefault()
    emit('sectionClick', 'about')
}
</script>

<template>
    <header
        class="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-900 dark:bg-neutral-950/90"
    >
        <div
            :class="[
                'mx-auto grid h-16 w-full grid-cols-3 items-center',
                panoramaMode ? 'max-w-none pl-6 pr-6 sm:pl-32 sm:pr-32' : 'max-w-5xl px-6',
            ]"
        >
            <a
                href="#top"
                class="col-start-1 flex items-center space-x-2 justify-self-start text-lg font-bold tracking-tight"
                @click="handleBrandClick"
            >
                <span class="inline-block h-3 w-3 rounded-none bg-brand-600" />
                <span>kenn.dev</span>
            </a>

            <nav
                class="col-start-2 hidden items-center justify-center space-x-8 text-sm font-medium md:col-start-2 md:flex"
            >
                <a
                    v-for="link in navLinks"
                    :key="link.section"
                    :href="link.href"
                    :class="[
                        'relative py-1 transition-colors',
                        isActive(link)
                            ? 'text-brand-600 dark:text-brand-100'
                            : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white',
                    ]"
                    :aria-current="isActive(link) ? 'page' : undefined"
                    @click="handleNavClick(link, $event)"
                >
                    {{ link.label }}
                    <span
                        v-if="isActive(link)"
                        class="absolute inset-x-0 -bottom-1 h-0.5 bg-brand-600"
                    />
                </a>
            </nav>

            <div class="col-start-3 flex items-center space-x-2 justify-self-end">
                <ViewToggle :panorama-mode="!!panoramaMode" @toggle="emit('togglePanorama')" />

                <ThemeToggle @toggle="emit('toggleTheme')" />

                <button
                    class="rounded-lg p-2 text-zinc-600 transition-all hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-900"
                    aria-label="Open Menu"
                    @click="mobileMenuOpen = !mobileMenuOpen"
                >
                    <i :class="['ph', mobileMenuOpen ? 'ph-x' : 'ph-list', 'text-lg']" />
                </button>
            </div>
        </div>

        <div
            v-show="mobileMenuOpen"
            class="space-y-3 border-t border-zinc-200 bg-white px-6 py-4 md:hidden dark:border-zinc-900 dark:bg-neutral-950"
        >
            <a
                v-for="link in navLinks"
                :key="link.section"
                :href="link.href"
                :class="[
                    'block py-2 font-medium',
                    isActive(link)
                        ? 'text-brand-600 dark:text-brand-100'
                        : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white',
                ]"
                @click="handleNavClick(link, $event)"
            >
                {{ link.label }}
            </a>
        </div>
    </header>
</template>
