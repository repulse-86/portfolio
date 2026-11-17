import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

export type PanoramaSection = 'about' | 'projects' | 'experience' | 'contact'

const PANEL_SELECTOR = '[data-panorama-panel]'
const VERTICAL_SELECTOR = '[data-panorama-vertical]'

const FIXED_WHEEL_STEP = 55
const SNAP_DURATION_MS = 240
const THRESHOLD_RATIO = 0.8
const WHEEL_SETTLE_MS = 110
const DRAG_CLICK_TOLERANCE = 4
const TOUCH_AXIS_TOLERANCE = 8

function getPanels(container: HTMLElement | null): HTMLElement[] {
    if (!container) return []
    return Array.from(container.querySelectorAll<HTMLElement>(PANEL_SELECTOR))
}

function getPanelOffset(panel: HTMLElement): number {
    const inset = Number(panel.dataset.panoramaInset ?? 0)
    return Math.max(0, panel.offsetLeft - (Number.isFinite(inset) ? inset : 0))
}

function findNearestPanelIndex(container: HTMLElement, panels: HTMLElement[]): number {
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    panels.forEach((panel, index) => {
        const distance = Math.abs(getPanelOffset(panel) - container.scrollLeft)
        if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = index
        }
    })

    return nearestIndex
}

export function usePanoramaScroll(container: Ref<HTMLElement | null>) {
    const activeSection = ref<PanoramaSection>('about')
    const activePanelIndex = ref(0)
    const panelCount = ref(0)

    let boundEl: HTMLElement | null = null
    let scrollFrame = 0
    let snapFrame: number | null = null
    let wheelTimer: ReturnType<typeof setTimeout> | null = null

    let gestureOriginIndex = 0

    let dragging = false
    let dragStartX = 0
    let dragStartScrollLeft = 0
    let dragMoved = false
    let suppressClick = false

    let touchActive = false
    let touchHorizontal = false
    let touchStartX = 0
    let touchStartY = 0
    let touchStartScrollLeft = 0

    const clampIndex = (index: number, length: number) => Math.max(0, Math.min(index, length - 1))

    const updateActivePanel = () => {
        const el = container.value
        const panels = getPanels(el)
        panelCount.value = panels.length
        if (!el || panels.length === 0) return

        const index = findNearestPanelIndex(el, panels)
        activePanelIndex.value = index

        const section = panels[index]?.dataset.panoramaSection as PanoramaSection | undefined
        if (section) activeSection.value = section
    }

    const scheduleUpdate = () => {
        if (scrollFrame) return
        scrollFrame = window.requestAnimationFrame(() => {
            scrollFrame = 0
            updateActivePanel()
        })
    }

    const cancelSnapAnimation = () => {
        if (snapFrame === null) return
        window.cancelAnimationFrame(snapFrame)
        snapFrame = null
    }

    const animateScrollTo = (targetX: number) => {
        const el = container.value
        if (!el) return

        cancelSnapAnimation()

        const startPos = el.scrollLeft
        const distance = targetX - startPos

        if (Math.abs(distance) < 1) {
            el.scrollLeft = targetX
            return
        }

        const startTime = window.performance.now()

        const step = (now: number) => {
            const progress = Math.min((now - startTime) / SNAP_DURATION_MS, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            el.scrollLeft = startPos + distance * ease

            if (progress < 1) {
                snapFrame = window.requestAnimationFrame(step)
            } else {
                el.scrollLeft = targetX
                snapFrame = null
            }
        }

        snapFrame = window.requestAnimationFrame(step)
    }

    const goToIndex = (index: number) => {
        const panels = getPanels(container.value)
        if (panels.length === 0) return

        const clamped = clampIndex(index, panels.length)
        gestureOriginIndex = clamped
        animateScrollTo(getPanelOffset(panels[clamped]))
    }

    const clampToAdjacentBounds = (rawTarget: number, originIndex: number) => {
        const panels = getPanels(container.value)
        if (panels.length === 0) return rawTarget

        const origin = clampIndex(originIndex, panels.length)
        const minBound = getPanelOffset(panels[Math.max(0, origin - 1)])
        const maxBound = getPanelOffset(panels[Math.min(panels.length - 1, origin + 1)])

        return Math.max(minBound, Math.min(maxBound, rawTarget))
    }

    const evaluateThresholdSnap = (originIndex: number) => {
        const el = container.value
        const panels = getPanels(el)
        if (!el || panels.length === 0) return

        const origin = clampIndex(originIndex, panels.length)
        const originPos = getPanelOffset(panels[origin])
        const delta = el.scrollLeft - originPos

        if (delta > 0 && origin < panels.length - 1) {
            const distanceToNext = getPanelOffset(panels[origin + 1]) - originPos
            goToIndex(delta >= distanceToNext * THRESHOLD_RATIO ? origin + 1 : origin)
            return
        }

        if (delta < 0 && origin > 0) {
            const distanceToPrev = originPos - getPanelOffset(panels[origin - 1])
            goToIndex(Math.abs(delta) >= distanceToPrev * THRESHOLD_RATIO ? origin - 1 : origin)
            return
        }

        goToIndex(origin)
    }

    const handleWheel = (event: WheelEvent) => {
        const el = container.value
        if (!el) return
        if (event.ctrlKey) return

        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            const vertical = (event.target as Element | null)?.closest<HTMLElement>(
                VERTICAL_SELECTOR,
            )

            if (vertical) {
                const atTop = vertical.scrollTop <= 0
                const atBottom =
                    vertical.scrollTop + vertical.clientHeight >= vertical.scrollHeight - 1
                const canScrollUp = event.deltaY < 0 && !atTop
                const canScrollDown = event.deltaY > 0 && !atBottom

                if (canScrollUp || canScrollDown) {
                    event.preventDefault()
                    cancelSnapAnimation()
                    vertical.scrollTop += event.deltaY
                    return
                }
            }
        }

        const panels = getPanels(el)
        if (panels.length === 0) return

        event.preventDefault()
        cancelSnapAnimation()

        if (!wheelTimer) {
            gestureOriginIndex = clampIndex(activePanelIndex.value, panels.length)
        }

        const rawDelta =
            Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
        if (rawDelta === 0) return

        const direction = Math.sign(rawDelta)
        const clamped = clampToAdjacentBounds(
            el.scrollLeft + direction * FIXED_WHEEL_STEP,
            gestureOriginIndex,
        )
        el.scrollLeft = clamped

        const origin = gestureOriginIndex
        const originPos = getPanelOffset(panels[origin])
        const deltaFromOrigin = clamped - originPos

        if (deltaFromOrigin > 0 && origin < panels.length - 1) {
            const distance = getPanelOffset(panels[origin + 1]) - originPos
            if (deltaFromOrigin >= distance * THRESHOLD_RATIO) {
                if (wheelTimer) {
                    clearTimeout(wheelTimer)
                    wheelTimer = null
                }
                goToIndex(origin + 1)
                return
            }
        } else if (deltaFromOrigin < 0 && origin > 0) {
            const distance = originPos - getPanelOffset(panels[origin - 1])
            if (Math.abs(deltaFromOrigin) >= distance * THRESHOLD_RATIO) {
                if (wheelTimer) {
                    clearTimeout(wheelTimer)
                    wheelTimer = null
                }
                goToIndex(origin - 1)
                return
            }
        }

        if (wheelTimer) clearTimeout(wheelTimer)
        wheelTimer = setTimeout(() => {
            wheelTimer = null
            evaluateThresholdSnap(gestureOriginIndex)
        }, WHEEL_SETTLE_MS)
    }

    const startDrag = (event: MouseEvent) => {
        if (event.button !== 0) return
        const el = container.value
        if (!el) return

        cancelSnapAnimation()
        dragging = true
        dragMoved = false
        suppressClick = false
        dragStartX = event.pageX
        dragStartScrollLeft = el.scrollLeft
        gestureOriginIndex = clampIndex(activePanelIndex.value, getPanels(el).length || 1)
    }

    const onDrag = (event: MouseEvent) => {
        if (!dragging) return
        const el = container.value
        if (!el) return

        const walk = event.pageX - dragStartX
        if (Math.abs(walk) > DRAG_CLICK_TOLERANCE) dragMoved = true
        if (!dragMoved) return

        event.preventDefault()
        el.scrollLeft = clampToAdjacentBounds(dragStartScrollLeft - walk, gestureOriginIndex)
    }

    const endDrag = () => {
        if (!dragging) return
        dragging = false

        if (dragMoved) suppressClick = true
        evaluateThresholdSnap(gestureOriginIndex)
    }

    const handleClickCapture = (event: MouseEvent) => {
        if (!suppressClick) return
        suppressClick = false
        event.preventDefault()
        event.stopPropagation()
    }

    const startTouch = (event: TouchEvent) => {
        if (event.touches.length !== 1) return
        const el = container.value
        const touch = event.touches[0]
        if (!el || !touch) return

        cancelSnapAnimation()
        touchActive = true
        touchHorizontal = false
        touchStartX = touch.clientX
        touchStartY = touch.clientY
        touchStartScrollLeft = el.scrollLeft
        gestureOriginIndex = clampIndex(activePanelIndex.value, getPanels(el).length || 1)
    }

    const onTouch = (event: TouchEvent) => {
        if (!touchActive) return
        const el = container.value
        const touch = event.touches[0]
        if (!el || !touch) return

        const deltaX = touch.clientX - touchStartX
        const deltaY = touch.clientY - touchStartY

        if (!touchHorizontal) {
            if (
                Math.abs(deltaX) < TOUCH_AXIS_TOLERANCE &&
                Math.abs(deltaY) < TOUCH_AXIS_TOLERANCE
            ) {
                return
            }

            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                touchActive = false
                return
            }

            touchHorizontal = true
        }

        event.preventDefault()
        el.scrollLeft = clampToAdjacentBounds(touchStartScrollLeft - deltaX, gestureOriginIndex)
    }

    const endTouch = () => {
        if (!touchActive) return
        touchActive = false
        if (touchHorizontal) evaluateThresholdSnap(gestureOriginIndex)
        touchHorizontal = false
    }

    const bindContainer = (el: HTMLElement | null) => {
        if (el === boundEl) return

        if (boundEl) {
            boundEl.removeEventListener('scroll', scheduleUpdate)
            boundEl.removeEventListener('wheel', handleWheel)
            boundEl.removeEventListener('mousedown', startDrag)
            boundEl.removeEventListener('mousemove', onDrag)
            boundEl.removeEventListener('mouseup', endDrag)
            boundEl.removeEventListener('mouseleave', endDrag)
            boundEl.removeEventListener('click', handleClickCapture, true)
            boundEl.removeEventListener('touchstart', startTouch)
            boundEl.removeEventListener('touchmove', onTouch)
            boundEl.removeEventListener('touchend', endTouch)
        }

        boundEl = el

        if (el) {
            panelCount.value = getPanels(el).length
            updateActivePanel()
            el.addEventListener('scroll', scheduleUpdate, { passive: true })
            el.addEventListener('wheel', handleWheel, { passive: false })
            el.addEventListener('mousedown', startDrag)
            el.addEventListener('mousemove', onDrag)
            el.addEventListener('mouseup', endDrag)
            el.addEventListener('mouseleave', endDrag)
            el.addEventListener('click', handleClickCapture, true)
            el.addEventListener('touchstart', startTouch, { passive: true })
            el.addEventListener('touchmove', onTouch, { passive: false })
            el.addEventListener('touchend', endTouch, { passive: true })
        }
    }

    const scrollToPanel = (index: number) => {
        goToIndex(index)
    }

    const scrollToSection = (section: PanoramaSection) => {
        const panels = getPanels(container.value)
        const index = panels.findIndex((panel) => panel.dataset.panoramaSection === section)

        if (index >= 0) goToIndex(index)
    }

    const nextPanel = () => goToIndex(activePanelIndex.value + 1)
    const prevPanel = () => goToIndex(activePanelIndex.value - 1)

    const isTypingTarget = (target: EventTarget | null) => {
        if (!(target instanceof HTMLElement)) return false
        return Boolean(
            target.closest(
                'input, textarea, select, [contenteditable="true"], [contenteditable=""]',
            ),
        )
    }

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
        if (isTypingTarget(event.target)) return

        switch (event.key) {
            case 'ArrowRight':
                event.preventDefault()
                nextPanel()
                break
            case 'ArrowLeft':
                event.preventDefault()
                prevPanel()
                break
            case 'Home':
                event.preventDefault()
                goToIndex(0)
                break
            case 'End':
                event.preventDefault()
                goToIndex(panelCount.value - 1)
                break
        }
    }

    const handleResize = () => {
        const index = activePanelIndex.value
        updateActivePanel()
        window.requestAnimationFrame(() => goToIndex(index))
    }

    watch(container, (el) => bindContainer(el), { flush: 'post' })

    onMounted(() => {
        bindContainer(container.value)
        window.addEventListener('resize', handleResize)
        window.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
        bindContainer(null)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('keydown', handleKeydown)
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
        if (wheelTimer) clearTimeout(wheelTimer)
        cancelSnapAnimation()
    })

    return {
        activeSection,
        activePanelIndex,
        panelCount,
        scrollToPanel,
        scrollToSection,
        nextPanel,
        prevPanel,
        updateActivePanel,
    }
}
