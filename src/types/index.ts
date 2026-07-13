export interface Skill {
    category: string
    technologies: string
}

export interface Experience {
    period: string
    title: string
    organization: string
    responsibilities: string[]
}

export type ProjectCategory = 'all' | 'systems' | 'personal'

export interface Project {
    id: string
    category: ProjectCategory
    techLabel: string
    techStack: string
    title: string
    description: string
    demoUrl: string
    badgeText: string
    images: string[]
    thumbnailImages: string[]
}

export interface ToastState {
    visible: boolean
    message: string
    isError: boolean
}
