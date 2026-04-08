# Canvas Screen — Idle State Spec

## Layout Measurements

```
┌─────────────────────────────────────────────────────────────┐
│  Topbar (48px tall)                                         │
│  [Breadcrumb (32px)]                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Canvas Area (viewport height − 80px topbar total)        │
│   Width: 100vw  Height: 100vh − 80px                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Topbar (48px): holds Sync button (right-aligned, 32px tall) and Settings icon (right-aligned).
Breadcrumb bar (32px): see navigation/breadcrumb spec.
Canvas area: fills remaining space. No internal padding — cards can be positioned near edges.

## Canvas Coordinate System

- Logical canvas size: 4096 × 4096 pixels (virtual; viewport is a window into this space).
- Initial pan offset: centers the primary card in the viewport.
- Origin (0,0): top-left of logical canvas. Card positions stored relative to this origin.

## Zoom

| Zoom level | Scale | Behavior                                          |
|------------|-------|---------------------------------------------------|
| Minimum    | 0.2×  | Primary card collapses to title+uuid only         |
| Default    | 1.0×  | Full card rendered with all sections               |
| Maximum    | 3.0×  | Full card, larger touch targets                    |

Zoom is centered on the cursor/pinch point, not the viewport center.
Zoom changed via: scroll wheel (0.1× per tick), pinch gesture (continuous), Cmd+/Cmd-.

## Pan

Pan via: drag on empty canvas space, two-finger scroll (trackpad), middle-mouse drag.
No boundary clamping — canvas is infinite. Auto-fit button (`[ ]` icon in bottombar) re-centers.

## Card Layout (Auto-Layout Fallback)

When no `layout.yaml` positions exist for external cards, auto-layout places them around the primary card:
- Primary card: centered in viewport.
- External cards: arranged in two columns — left column for incoming links, right column for outgoing links.
- Column gap from primary card edge: 200px.
- Card spacing within column: 40px vertical gap.

## Active Interactions in Idle State

- Pan canvas: drag empty space
- Zoom: scroll / pinch
- Select card: single-click primary card or external card → transition to node-selected
- Drill in: double-click submodule port row on primary card → transition to drilled
- Navigate to external: double-click external reference card → navigate to that module's canvas
- Command palette: Cmd+K (overlay, does not change state)
- Drag external card: drag to reposition (writes to layout.yaml on mouse-up)
- Draw link: drag from connection handle (begins edge creation)
- Sync: click Sync button → opens sync panel (overlay)
