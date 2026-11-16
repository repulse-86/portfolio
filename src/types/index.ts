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
    descriptionHtml: string
    shortDescription?: string
    shortDescriptionHtml?: string
    demoUrl: string
    images: string[]
    thumbnailImages: string[]
}

export type ProjectInput = Omit<Project, 'descriptionHtml' | 'shortDescriptionHtml'>

export interface ToastState {
    visible: boolean
    message: string
    isError: boolean
}
