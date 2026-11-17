import { marked } from 'marked'

const cache = new Map<string, string>()

export function useMarkdown() {
    const parse = (source: string): string => {
        let html = cache.get(source)
        if (html === undefined) {
            html = marked.parse(source, { async: false }) as string
            cache.set(source, html)
        }
        return html
    }

    return { parse }
}
