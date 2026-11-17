# Implementation Plan — Reduce JS, Prefer HTML → CSS → JS

## Ranking rule

For each behaviour: (1) can the platform do it? (2) can CSS do it? (3) keep the smallest JS possible — event-driven, passive, no per-frame reactive writes.

## Inventory: where the JS weight is

| Area | File | Nature |
| --- | --- | --- |
| Panorama drag/wheel/touch/snap/threshold engine | `PanoramaView.vue` (460 lines), `usePanoramaScroll.ts` (456 lines) | Duplicated; both re-implement the same thing |
| Layout measurement in JS | `PanoramaProjects.vue` (127 lines: ResizeObserver + resize listener + tile/rows/width math + `widthChange` emit → `projectsWidth` in `PanoramaView`) | CSS could own all of it |
| Scroll position mirror | `scrollX` ref in `PanoramaView.vue` — written on every scroll/drag/rAF frame, never read | Pure overhead per frame |
| Footer "Back to Top" | `AppFooter.vue` | Native `<a href="#top">` |
| Modal plumbing | `ProjectModal.vue` (manual Escape, focus/scroll lock, Teleport) | `<dialog>` does it natively |
| Clipboard | `useClipboard.ts` (execCommand, hidden textarea, extra timer) | `navigator.clipboard.writeText` + one timer |
| Theme | `useTheme.ts` (onMounted class flip, prop chain to `ThemeToggle`) | Inline boot script + CSS icon swap |
| Mobile menu | `AppHeader.vue` `mobileMenuOpen` + `v-show` | `popover` attribute (optional) |
| Eager image preloading | `useImagePreloader.ts` — `new Image()` for every URL | `loading="lazy"` / `decoding="async"` |
| Markdown parsing | `ProjectCard.vue`, `ProjectModal.vue`, `PanoramaProjectDetail.vue` — `marked.parse` per card/mount | Memoize or precompute |

## Phase 0 — Native HTML / CSS quick wins

Low risk, no behaviour change.

1. **Footer Back to Top → native anchor** (`AppFooter.vue`)
   Replace the `<div @click="scrollToTop">` with `<a href="#top">` (root already has `id="top"`); `html { scroll-smooth }` already animates it. Delete `scrollToTop`. Also fixes keyboard access. Effort S — removes 1 handler + 3 lines.

2. **Email as a native link** (`ContactSection.vue`, `PanoramaContact.vue`)
   Wrap the address in `<a href="mailto:johnkenneth.ornias@gmail.com">`. Keep the copy button (clipboard genuinely needs JS).

3. **Project modal → `<dialog>`** (`ProjectModal.vue`)
   `showModal()` gives Escape-to-close natively (no keydown listener), background inert, `::backdrop`. Use CSS for scroll lock — `body:has(dialog[open]) { overflow: hidden }` — deleting the `document.body.style.overflow` mutation. Drop the manual Escape branch; keep ArrowLeft/Right for the lightbox only. Remove `Teleport`. Effort M — removes ~20 lines + one global listener + body style mutation.

4. **Theme: no flash, no prop chain**
   - Inline ~4-line script in `index.html` that sets dark from `localStorage` before paint (kills the light-mode flash caused by `onMounted` and the hardcoded `class="dark"`).
   - `ThemeToggle` renders both icons with `dark:hidden` / `hidden dark:inline`, so the icon no longer needs the `darkMode` prop.
   - JS keeps only: toggle class + persist. Effort S — removes a prop, an import, one re-render.

5. **Toast semantics** — add `role="status"` `aria-live="polite"` and a CSS keyframe for entrance; keep only the auto-hide timer.

6. **Clipboard API** (`useClipboard.ts`)
   `navigator.clipboard.writeText(email)` with try/catch fallback toast. Delete the hidden textarea + `execCommand`. Collapse the two timers (label reset + toast hide) into one, and clear it in `onUnmounted`. Effort S — removes ~15 lines, one DOM node, one timer, fixes a leaked timer.

## Phase 1 — CSS owns panorama layout

Highest payoff.

7. **`PanoramaProjects.vue` → pure CSS sizing**
   Today: `window.innerWidth` listener + ResizeObserver + tileWidth/rows/columns/gridWidth + `widthChange` emit → `projectsWidth` → inline width on the section.

   Replace with a grid whose height drives tile size:
   - `grid-template-rows: repeat(var(--rows), 1fr)`, `grid-auto-flow: column`, fixed column count via media query.
   - Tiles: `aspect-ratio: 4/3` (`object-cover` image).
   - Section width: `width: max-content` so the track measures itself.
   - `--rows` is the only JS-derived value (`ceil(count / 5)`) — a single static number, no measurement, no observers.
   - Mobile keeps the current 2-column vertical layout through a media query.

   Removes: ResizeObserver, resize listener, `containerHeight`, `viewportWidth`, `tileWidth`, `rows`, `columns`, `gridStyle`, `widthChange`, `projectsWidth`, `getSectionWidthStyle` special case. Effort M — ~80 lines of TS gone, per-resize work gone.

8. **`PanoramaView.vue` → CSS scroll snap + native scrolling**
   Replace the width model + `snapPoints` math with:
   - `scroll-snap-type: x mandatory`, `scroll-padding-left` matching the `pl-6 sm:pl-32` gutter, `scroll-snap-align: start` on each section; two invisible snap anchors inside the wide projects section to keep the existing two-stop behaviour (projects → experience).
   - Nav click → `section.scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'smooth' })`; delete `snapPoints`, `getSectionWidthPx/Vw`, `animateScrollTo`, `snapToIndex`, `getNearestSnapIndex` clamp logic.
   - Active section → IntersectionObserver (root = viewport, threshold tuned to the left gutter) or a single `scrollend` listener with a scroll+rAF fallback for Safari < 18. No per-frame refs.
   - Delete `scrollX` (dead) and `currentSnapIndex` writes; keep active-section emission only on change (guard with `if (section === lastEmitted) return`).
   - Delete `FIXED_WHEEL_STEP`, `SNAP_DURATION_MS`, `SNAP_IDLE_DELAY_MS`, `snapAnimFrame`, `snapIdleTimer`, `getWheelDelta`, `onWheel`, `startTouch`/`onTouch`/`endTouch`.
   - Keep only: one pointerdown/move/up drag handler (native snap settles it) and, if wheel-to-horizontal is kept, one 5-line wheel translator that just does `el.scrollBy({ left: delta })`.
   - Add `overscroll-behavior-x: contain`, `contain: layout paint` on panels, `content-visibility: auto` + `contain-intrinsic-size` on off-screen sections.
   - Add `tabindex="0"` to the track so native arrow-key scrolling works; delete the custom keydown handling.

   Effort L, risk M. Biggest LOC reduction (~200 lines) and removes all rAF/timer scroll work.

9. **Vertical scroll trap → CSS**
   `overscroll-behavior: contain` on the experience/projects vertical panels plus `overscroll-behavior-x: contain` on the track gives native scroll chaining; delete `data-panorama-vertical`, `getVerticalPanel`, and the wheel branch.

## Phase 2 — Collapse the duplicated engines

10. **One small composable instead of two engines**
    `usePanoramaScroll.ts` is used only by `PanoramaProjectDetail.vue`, and only for wheel/drag/keyboard snapping (its `activeSection`, `panelCount`, `scrollTo*`, `activePanelIndex` return values are unused there). Meanwhile `PanoramaView` has its own copy.

    Plan: delete the threshold/wheel/drag/touch machinery; keep a ~50-line `usePanoramaSnap(viewport)` that provides `scrollTo(el)` + `activeIndex` via IntersectionObserver, shared by both views. `PanoramaProjectDetail` keeps Esc/Arrow keys scoped to the view, not `window`.

    Effort M — deletes ~350 lines.

## Phase 3 — Remaining JS, optimised

11. **Markdown** — parse once per project at data-import time (`data/projects.ts` exports `descriptionHtml`) or memoize by project id in a `Map`. Eliminates repeated `marked.parse` per view switch and per modal open. CPU win.

12. **Images** — drop `useImagePreloader`; add `loading="lazy"` `decoding="async"`, `fetchpriority="high"` on the hero, and `sizes`/`width`/`height` to avoid layout shift. Memory/network win (dozens of decoded images currently held).

13. **Listeners** — audit for: one listener per container (delegation), `passive: true` unless `preventDefault` is required, `matchMedia('(max-width: ...)')` + `change` instead of `windowWidth` refs + resize listeners, cleanup on unmount for every timer (`toastTimeout`, copy-label timer).

14. **Mode switch scroll reset** (`App.vue`) — keep, but reduce to one call (`window.scrollTo({ top: 0, behavior: 'instant' })`); drop `document.documentElement.scrollTop` and the double reset once the transition no longer needs it.

## What legitimately stays JS

Theme persistence, clipboard, project filtering, modal/lightbox state, back/close buttons, active-section tracking (IO), mode toggle, and the `scrollIntoView` calls. Everything else above is HTML/CSS work.

## Success metrics

- `PanoramaView.vue` 460 → ~180 lines; `usePanoramaScroll.ts` 456 → ~60 (or removed); `PanoramaProjects.vue` −80 lines.
- Zero `requestAnimationFrame` snap loops, zero snap `setTimeout`s, zero per-scroll ref writes.
- One scroll-related listener set (IO + optional `scrollend`), all passive.
- Manual checklist: nav snap all 4 sections + 2 projects stops, nav underline correct (incl. Contact), wheel/drag/touch on desktop + phone, vertical experience scroll, enter/exit mode at scroll 0, deep link `#contact` in both modes, Esc closes modal/detail, theme persists with no flash, copy email.

## Risks

- CSS snap can feel different from the custom "80% threshold" commit (usually better); desktop click-drag must be kept explicitly.
- `<dialog>` changes stacking (z-index vs existing `z-50`) — verify lightbox `z-[60]`.
- `scrollend` support: fall back to IO, which works everywhere modern.

## Commit plan

One commit per phase:

1. `refactor: use native HTML and CSS for small interactions` (Phase 0, items 1–6)
2. `refactor: let CSS own panorama layout and snapping` (Phase 1, items 7–9)
3. `refactor: collapse panorama scroll engines` (Phase 2, item 10)
4. `perf: trim remaining frontend JS` (Phase 3, items 11–14)

Phase 2 depends on Phase 1 landing first, since the shared composable assumes CSS snap owns settling.
