<script setup lang="ts">
const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

interface FooterLink {
    label: string
    href: string
    activeColor: string
}

const links: FooterLink[] = [
    { label: 'Home', href: '#top', activeColor: 'group-hover:bg-black dark:bg-white' },
    { label: 'About', href: '#about', activeColor: 'group-hover:bg-tertiary' },
    { label: 'Experience', href: '#experience', activeColor: 'group-hover:bg-primary' },
    { label: 'Projects', href: '#projects', activeColor: 'group-hover:bg-success' },
    { label: 'Contact', href: '#contact', activeColor: 'group-hover:bg-white' },
]
</script>

<template>
    <footer
        class="bg-white dark:bg-black text-black dark:text-white pb-16 px-0 sm:px-4 relative overflow-hidden"
    >
        <div>
            <div
                class="w-full text-left break-all leading-[0.8] tracking-tighter uppercase font-black"
            >
                <span v-for="link in links" :key="link.label" class="inline group">
                    <a
                        :href="link.href"
                        class="text-6xl sm:text-[12vw] transition-all text-black/30 hover:text-black dark:text-white/20 dark:hover:text-white inline"
                    >
                        {{ link.label }}
                    </a>

                    <span
                        :class="[
                            'inline-block w-4 h-4 sm:w-[3vw] sm:h-[3vw] rounded-full bg-black/10 dark:bg-white/10 transition-colors duration-300 mx-2 sm:mx-[1vw]',
                            link.activeColor,
                        ]"
                    >
                    </span>
                </span>
            </div>

            <div
                class="pt-16 flex flex-col md:flex-row justify-end items-center gap-8 font-mono text-[10px] uppercase tracking-[0.5em] opacity-40"
            >
                <div
                    class="flex items-center gap-4 group cursor-pointer hover:opacity-100 transition-opacity"
                    @click="scrollToTop"
                >
                    <span class="group-hover:text-success transition-colors">Back to Top</span>
                    <svg
                        class="w-4 h-4 group-hover:-translate-y-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                </div>
            </div>
        </div>
    </footer>
</template>
