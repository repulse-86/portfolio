export function getSnapPoints(viewport: HTMLElement | null): number[] {
    if (!viewport) return []
    const track = viewport.firstElementChild
    if (!track) return []

    const pad = Number.parseFloat(getComputedStyle(viewport).scrollPaddingLeft) || 0
    return Array.from(track.children)
        .filter((child): child is HTMLElement => child instanceof HTMLElement)
        .map((child) => Math.max(0, child.offsetLeft - pad))
}

export function findNearestIndex(points: number[], position: number): number {
    if (points.length === 0) return 0

    let nearestIdx = 0
    let minDiff = Infinity
    points.forEach((point, index) => {
        const diff = Math.abs(position - point)
        if (diff < minDiff) {
            minDiff = diff
            nearestIdx = index
        }
    })
    return nearestIdx
}
