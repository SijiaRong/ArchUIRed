# Canvas Screen — Node Selected State Spec

## Overview

Node-selected is a superset of the idle state — all idle-state canvas interactions remain fully active. The only structural difference is the presence of the detail panel and the selected card's highlight treatment.

---

## Layout Measurements

```
┌──────────────────────────────────────────┬──────────────────┐
│  Topbar (48px) — breadcrumb inside       │                  │
├──────────────────────────────────────────┤  Detail Panel    │
│                                          │  width: 320px    │
│  Canvas Area                             │  position: fixed │
│  width: 100vw − 320px                    │  right: 0        │
│  height: 100vh − 80px                    │  top: 80px       │
│                                          │  height: 100vh   │
│                                          │          − 80px  │
│                                          │  z-index: 20     │
│                                          │                  │
└──────────────────────────────────────────┴──────────────────┘
```

- **Topbar:** identical to idle — 48px, breadcrumb inside, Sync + Settings at right.
- **Canvas area:** Narrows to `100vw − 320px` when the panel is open. Width transition runs simultaneously with the panel slide-in animation (180ms ease-out).
- **Detail panel:** Fixed position, anchored to the right viewport edge. Rendered above the canvas (`z-index: 20`) but below the topbar. Full spec in `gui/components/detail-panel`.
- **Mobile (viewport width < 640px):** Detail panel becomes a bottom sheet (50vh tall, slides up from the bottom). Not yet implemented in v1 — deferred.

---

## Canvas Coordinate System and Zoom/Pan

Identical to idle state — see `idle/resources/spec.md`. No changes to the coordinate system, zoom table, or pan behavior apply in node-selected.

The canvas may perform a minor pan to ensure the selected card remains fully visible after the panel opens (if the card was near the right edge and would be occluded by the panel).

---

## Selected Card Visual Treatment

The selected card uses the `selected` visual state defined in `gui/components/primary-module-card`:

| Property | Selected value | Token |
|---|---|---|
| Border | 2px solid | `color/border/focus` (blue, `#2563EB` light / `#5B8DEE` dark) |
| Background | Tinted | `color/interactive/selected-bg` |
| Shadow | Elevated glow | `elevation/card/selected` (0 0 0 3px rgba(37,99,235,0.20)) |
| Description section | Expanded | Visible at `dimension/node-body-height` (52px) |
| Drill-in icon [↗] | Full opacity | opacity 1.0 |

- The selected card does NOT move from its canvas position when selected.
- Both the primary card and external reference cards can be in the selected state.
- Only one card is selected at a time — selecting a second card atomically replaces `selectedUuid`.

---

## Detail Panel

The detail panel is provided by `gui/components/detail-panel`. Summary of its content in this context:

```
┌────────────────────────────────────────┐  ← 320px wide
│  Module Name (24px bold, accent color) │
│  6f1c4a9d (11px mono, opacity 0.45)    │
│                                        │
│  Description text, natural wrap.       │
│                                        │
│  ──────────────────────────────────    │  ← section separator (mt: 32px)
│  SUBMODULES (N)                        │  ← shown only when N > 0
│  ›  Submodule Alpha                    │
│  ›  Submodule Beta                     │
│                                        │
│  ──────────────────────────────────    │
│  LINK TO (N)                           │  ← shown only when N > 0
│  [depends-on]  Target Module           │
│                                        │
│  ──────────────────────────────────    │
│  LINKED BY (N)                         │  ← shown only when N > 0
│  [implements]  Source Module           │
└────────────────────────────────────────┘
```

- **Clicking a submodule row** in the panel navigates to that submodule's parent canvas and selects + centres the submodule. Canvas transitions to idle at the new level, then selects the target card.
- **Clicking a Link to / Linked by row** navigates to the target module's canvas level and selects the module. Panel dismisses if navigating away changes `selectedUuid` to null.
- **Empty sections** are hidden entirely — no zero-count headings rendered.

### Panel Dimensions and Tokens

| Property | Value | Token |
|---|---|---|
| Width | 320px | `dimension/detail-panel-width` |
| Top offset | 80px (below topbar) | `dimension/topbar-height` + breadcrumb |
| Height | `calc(100vh − 80px)` | — |
| Horizontal padding | 20px | `spacing/5` |
| Top padding | 20px | `spacing/5` |
| Bottom padding | 32px | `spacing/8` |
| Background | `color/surface/raised` | `#FFFFFF` / `#26262B` |
| Left border | 1px solid `color/border/default` | `#C8C8D0` / `#3A3A42` |
| z-index | 20 | — |

---

## Panel Animation

### Opening (entering node-selected)

```
Panel:   transform: translateX(320px) → translateX(0)
         transition: 180ms ease-out
         will-change: transform

Canvas:  width: 100vw → 100vw − 320px
         transition: 180ms ease-out
```

Both animations start simultaneously. The panel decelerates into its resting position; the canvas area simultaneously narrows.

### Closing (returning to idle)

```
Panel:   transform: translateX(0) → translateX(320px)
         transition: 120ms ease-in

Canvas:  width: 100vw − 320px → 100vw
         transition: 120ms ease-in
```

The panel accelerates off-screen; the canvas area simultaneously widens back to full width.

---

## Interactions in Node-Selected State

All idle-state interactions remain active. Additional interactions:

| Interaction | Input | Effect |
|---|---|---|
| Clear selection | Click empty canvas area | Transition → idle; clears `selectedUuid`; panel slides out |
| Clear selection | Press Escape | Transition → idle; clears `selectedUuid`; panel slides out |
| Replace selection | Single-click a different card | Stays in node-selected; atomically replaces `selectedUuid`; panel content updates to new module without animation (instant swap) |
| Drill in from selected card | Double-click a submodule port row | Transition → drilled; pushes navStack; clears `selectedUuid`; panel closes; canvas re-renders |
| Navigate via panel submodule row | Click a submodule row in the detail panel | Navigate to submodule's parent canvas; select + centre target card at new level. Transitions through idle at the new level, then selects target |
| Navigate via panel link row | Click a Link to / Linked by row in the detail panel | Navigate to target module's canvas level; select the module if visible; panel updates or dismisses |
| Close panel button | Click [×] if shown | Transition → idle; same as Escape |
