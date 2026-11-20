<script setup lang="ts">
import type { Skill } from '@/types'
import { about, headline, intro } from '@/data/profile'
import SkillBlock from '@/components/shared/SkillBlock.vue'

defineProps<{
    skills: Skill[]
}>()

const emit = defineEmits<{
    navigate: [section: 'projects' | 'contact']
}>()
</script>

<template>
    <div class="flex flex-col text-left">
        <div class="space-y-8">
            <h1
                class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 max-w-4xl"
            >
                {{ headline.before }}
                <span class="text-brand-600 dark:text-brand-100 font-bold">{{
                    headline.highlight
                }}</span
                >.
            </h1>

            <p
                class="text-lg leading-relaxed font-light text-zinc-600 dark:text-zinc-400 max-w-2xl"
            >
                {{ intro.lead }}
                <strong class="font-medium text-zinc-900 dark:text-white">{{ intro.name }}</strong
                >. {{ intro.body }}
            </p>

            <div class="flex flex-col sm:flex-row gap-4">
                <button
                    type="button"
                    class="group inline-flex items-center justify-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors"
                    @click="emit('navigate', 'projects')"
                >
                    Explore My Projects
                    <i
                        class="ph ph-arrow-right ml-2 transition-transform group-hover:translate-x-1"
                    />
                </button>
                <button
                    type="button"
                    class="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    @click="emit('navigate', 'contact')"
                >
                    Get in Touch
                </button>
            </div>

            <div
                class="space-y-3 leading-relaxed font-light text-zinc-600 dark:text-zinc-400 max-w-2xl mt-6"
            >
                <p>
                    {{ about.paragraphOneBefore }}
                    <strong class="text-zinc-900 dark:text-white">{{ about.degree }}</strong>
                    {{ about.paragraphOneAfter }}
                </p>
                <p>{{ about.paragraphTwo }}</p>
            </div>
        </div>

        <div class="pt-8 space-y-4">
            <div class="space-y-3">
                <span class="text-xs font-bold tracking-widest text-brand-600 uppercase"
                    >Background</span
                >
                <h2 class="text-2xl font-bold tracking-tight">Who I Am</h2>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    Core Technology Focus
                </h3>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SkillBlock
                        v-for="(skill, index) in skills"
                        :key="index"
                        :category="skill.category"
                        :technologies="skill.technologies"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
