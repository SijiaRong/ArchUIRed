# Title Reveal — Interaction Spec

## States

| State | Trigger | Title font-size | Description opacity | Description max-height |
|---|---|---|---|---|
| **Resting** | No hover, not selected | `22px` | `0` | `0` (collapsed) |
| **Active** | Hover OR selected | `typography/node-name` = `14px` | `1` | natural height |

## Layout Contract

The header and description sections occupy a combined region. In the resting state, the title font-size expands to 22px to visually fill the description area — the card reads as a bold label. The description element is always present in the DOM tree; only its `opacity` and `max-height` change, never its presence.

The card can only grow downward as the description reveals. The header region and elements above it never shift. The card never shrinks when transitioning from active back to resting (until the description has fully collapsed).

## Transition Timing

### Entering Active State (resting → active)

| Property | Duration | Easing | Notes |
|---|---|---|---|
| `font-size` (title) | 220ms | `ease-out` | Starts immediately |
| `max-height` (description) | 220ms | `ease-out` | Starts simultaneously with font-size |
| `opacity` (description) | 180ms | `ease-in` | Starts after 40ms delay |

The title shrinks and the description region opens first; the text then fades in as the region reaches its natural size.

### Returning to Resting State (active → resting)

| Property | Duration | Easing | Notes |
|---|---|---|---|
| `opacity` (description) | 80ms | `ease-in` | Starts immediately (fade out first) |
| `font-size` (title) | 220ms | `ease-out` | Starts after 80ms (after opacity fade) |
| `max-height` (description) | 220ms | `ease-out` | Starts after 80ms |

The description text fades out first, then the container collapses and the title expands back.

## Annotated State Diagrams

### Resting State

```
┌──────────────────────────────────┐
│ ●                          [↗]  │  ← header row: 36px
│                                  │
│   Module Name (22px, expanded)   │  ← title fills description zone
│                                  │  ← description: opacity 0, max-height 0
└──────────────────────────────────┘
  total visible height = header + 0px description = 36px + 0px
  (port section if present starts directly below header)
```

### Active State (Hover or Selected)

```
┌──────────────────────────────────┐
│ ●  Module Name (14px)      [↗]  │  ← header row: 36px, title at normal size
├──────────────────────────────────┤
│◀                              ▶│
│  One-sentence description text.  │  ← description: opacity 1, max-height = natural
│                                  │  ← body height: dimension/node-body-height = 52px
└──────────────────────────────────┘
  total visible height = 36px + 52px + port rows
```

## DOM Structure

The animation is purely CSS/style-driven. The DOM structure does not change between states.

```
<div class="card">
  <div class="header">
    <span class="status-dot" />
    <span class="title" style="font-size: {interpolated}">Module Name</span>
    <span class="drill-in-icon" />
  </div>
  <div class="description" style="opacity: {interpolated}; max-height: {interpolated}">
    One-sentence description text.
    <span class="handle left" />
    <span class="handle right" />
  </div>
  <div class="port-section">...</div>
</div>
```

Screen readers must be able to access the description text regardless of its visual opacity. Use `aria-hidden="false"` on the description container at all times.

## Font-Size Values

| State | Value | Source |
|---|---|---|
| Resting (expanded) | 22px | Hardcoded override (larger than any token) |
| Active (normal) | 14px | `typography/node-name` |

The 22px resting size is not a design system token; it is the fixed expansion size for this animation only. Do not reference it from typography tokens.

## Accessibility

Users with `prefers-reduced-motion: reduce` must receive an **instant switch** (no CSS transition) between resting and active states. Implement via:

```css
@media (prefers-reduced-motion: reduce) {
  .title, .description {
    transition: none !important;
  }
}
```

The description text must always be reachable by screen readers (keyboard tab navigation, screen reader virtual cursor) regardless of visual opacity.

## Interaction Precedence

- **Selection beats hover:** when a card is selected, it remains in the active state even when the mouse leaves. The active state only reverts to resting after deselection.
- **Hover does not trigger selection:** hovering does not change the card's selection status in the module graph.
