import type { InjectionKey } from 'vue'

export interface PanoramaRegistration {
    id: string
    /** Effective span for the current breakpoint, in regular-section units. */
    getSpan: () => number
}

export interface PanoramaContext {
    register: (entry: PanoramaRegistration) => void
    unregister: (id: string) => void
}

export const PANORAMA_CONTEXT: InjectionKey<PanoramaContext> = Symbol('panorama')
