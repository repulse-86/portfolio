<script setup lang="ts">
import type { Skill } from '@/types'
import SkillBlock from '@/components/ui/SkillBlock.vue'

defineProps<{
    skills: Skill[]
}>()
</script>

<template>
    <section id="about" class="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-5 space-y-4">
            <span class="text-xs uppercase font-bold tracking-widest text-brand-600"
                >Background</span
            >
            <h2 class="text-3xl font-bold tracking-tight">Who I Am</h2>
        </div>

        <div
            class="lg:col-span-7 space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed font-light"
        >
            <p>
                I have built a strong engineering foundation centered on modern frameworks, secure
                authorization structures, and optimal database layouts. I hold a
                <strong>Bachelor of Science in Information Technology (Cum Laude, 2023)</strong>
                from Fellowship Baptist College.
            </p>
            <p>
                My professional philosophy highlights modular programming practices, strict design
                patterns, and close technical coordination to transform clean specifications into
                high-performance web realities.
            </p>

            <div class="pt-4">
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
                    Core Technology Focus
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SkillBlock
                        v-for="(skill, index) in skills"
                        :key="index"
                        :category="skill.category"
                        :technologies="skill.technologies"
                    />
                </div>
            </div>
        </div>
    </section>
</template>
