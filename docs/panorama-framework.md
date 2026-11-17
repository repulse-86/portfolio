# Panorama framework

A horizontal, snap-per-section scroller with no knowledge of the content it holds. Sections
declare **how many units wide** they are; the framework derives snap stops from that number
alone.

## Metrics

Two numbers per breakpoint, exposed as CSS custom properties on the scroll container:

| Token         | Desktop (`>= 640px`) | Mobile (`< 640px`) | Meaning                                  |
| ------------- | -------------------- | ------------------ | ---------------------------------------- |
| `--pano-unit` | `50vw`               | `85vw`             | width of one regular (span 1) section    |
| `--pano-gap`  | `4rem`               | `1rem`             | space between sections                   |
| `--pano-pad`  | `8rem`               | `1.5rem`           | `scroll-padding` / leading track padding |
| `--pano-stride` | `unit + gap`       | `unit + gap`       | travel per tick, one regular section     |

### Configuring the rhythm

```html
<Panorama unit="88vw" unit-sm="65vw" gap="0rem" pad="0rem">
```

Each prop takes any CSS length. `unit` / `gap` / `pad` apply at **every** breakpoint (they are the
mobile-and-up value); `unitSm` / `gapSm` / `padSm` override from 640px up. Omitted props fall back
to the table above. Props are bound as `--pano-*-base` / `--pano-*-sm` inputs and the track resolves
them per breakpoint, so the CSS defaults still win when nothing is passed.

The track needs a **definite height from the consumer** (`flex-1 min-h-0` in a flex column, or
`h-[calc(100vh-64px)]`) - sections are `height: 100%` of it. Section bodies only scroll
vertically when they are marked `scrollable`.

A section of span `n` is sized by formula, never by its content:

```css
width: calc(var(--pano-unit) * n + var(--pano-gap) * (n - 1));
```

The `(n - 1)` term swallows the internal gaps, so a 2-span section is exactly two units plus the
gap it covers. Sections stay on one uniform rhythm regardless of span, which is what makes the
stops computable up front. A wide section is **one continuous box** - nothing is nested or
spaced inside it by the framework.

## Stops

```
stop i  ->  x = pad + i * stride
section ->  [startIndex, startIndex + span)
```

A 2-span section owns two consecutive stops, both inside the same continuous element. Nothing
in the DOM has to be split or measured to know that.

Because every stop is an integer multiple of `stride`, both the native CSS snap points and the
JS index math are pure arithmetic:

- **Snapping** is native: `scroll-snap-type: x mandatory` on the track, `scroll-snap-stop: always`
  plus `scroll-snap-align: start` on each section, and one invisible 1px anchor per extra unit of
  a wide section. One gesture travels one stride; the browser keeps momentum, touch physics and
  accessibility.
- **Position** is derived, not observed: `index = round((scrollLeft - pad) / stride)`, and the
  active section is whichever `[start, start + span)` contains that index. No
  `getBoundingClientRect` scans over section children.

## Components

```
<Panorama @section-change="onSectionChange" ref="pano">
  <PanoramaSection id="about" title="about">...anything...</PanoramaSection>
  <PanoramaSection id="projects" title="projects" :span="2">...anything...</PanoramaSection>
  <PanoramaSection id="experience" title="experience">...anything...</PanoramaSection>
</Panorama>
```

`Panorama` owns the track, the stop table, index tracking and programmatic scrolling:

| Member                                | Description                                                          |
| ------------------------------------- | -------------------------------------------------------------------- |
| `scrollToSection(id, { lead?: number })` | scroll a section's start into view; `lead` lands `lead` stops earlier |
| `scrollToIndex(i)`                    | scroll to an absolute stop                                            |
| `activeIndex` / `activeSection`       | current stop and owning section id (reactive)                         |
| `totalStops`                          | number of stops in the track                                          |
| `@section-change`                     | emitted when the active section id changes                            |
| `@index-change`                       | emitted when the active stop changes                                  |

`PanoramaSection` declares `id`, optional `title`/header slot, `span` (integer, default 1) and
`spanSm` (span from 640px up, optional). It registers itself with the parent and renders its own
width, its snap anchors and an optional internally scrolling body. `span` is deliberately not
reactive to content: if a section needs more room, change the span.

Keyboard: the track is focusable and `ArrowLeft` / `ArrowRight` step exactly one stop.

## Rules

1. Content never reports its width upward. The framework never adapts to content; content adapts
   inside a fixed span.
2. `span` is a positive integer. Fractional spans have no valid stop grid.
3. Wide sections are continuous. If content needs sub-sections, that is the content's own
   layout, not the framework's.
4. Vertical overflow is the section's business (`scrollable` body), not the framework's.
5. Reuse the components instead of re-implementing a scroller - the project detail view is the
   same framework with one section per panel.
