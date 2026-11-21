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

            <div class="col-start-3 flex items-center space-x-6 justify-self-end">
                <ViewToggle :panorama-mode="!!panoramaMode" @toggle="emit('togglePanorama')" />

                <ThemeToggle @toggle="emit('toggleTheme')" />

                <button
                    class="inline-flex items-center justify-center rounded-lg text-zinc-600 transition-all hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-900"
                    aria-label="Open Menu"
                    @click="mobileMenuOpen = !mobileMenuOpen"
                >
                    <i
                        :class="['ph', mobileMenuOpen ? 'ph-x' : 'ph-list', 'text-lg leading-none']"
                    />
                </button>
            </div>
        </div>
    </header>

    <Teleport to="body">
        <Transition name="mobile-menu">
            <div
                v-if="mobileMenuOpen"
                class="fixed inset-0 z-30 bg-white/95 backdrop-blur-md md:hidden dark:bg-neutral-950/95"
            >
                <nav
                    class="flex h-full flex-col justify-center gap-6 px-6 pb-8 text-5xl leading-[0.85] lowercase tracking-tighter"
                    aria-label="Mobile navigation"
                >
                    <a
                        v-for="(link, index) in navLinks"
                        :key="link.section"
                        :href="link.href"
                        :class="[
                            'mobile-menu-link w-fit font-black transition-colors',
                            isActive(link)
                                ? 'text-brand-600'
                                : 'text-zinc-700 hover:text-brand-600 dark:text-zinc-300 dark:hover:text-white',
                        ]"
                        :style="{ animationDelay: `${300 + index * 180}ms` }"
                        :aria-current="isActive(link) ? 'page' : undefined"
                        @click="handleNavClick(link, $event)"
                    >
                        {{ link.label }}
                    </a>
                </nav>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
    transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
    transform: translateY(-100%);
}

.mobile-menu-link {
    animation: mobile-menu-item-in 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes mobile-menu-item-in {
    from {
        opacity: 0;
        transform: translateY(14px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .mobile-menu-enter-active,
    .mobile-menu-leave-active {
        transition: none;
    }

    .mobile-menu-link {
        animation: none;
    }
}
</style>
