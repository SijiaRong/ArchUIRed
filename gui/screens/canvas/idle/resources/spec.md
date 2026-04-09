# Canvas Screen — Idle State Spec

## Layout Measurements

```
┌─────────────────────────────────────────────────────────────┐
│  Topbar (48px tall)                                         │
│  Breadcrumb bar (32px tall, inside topbar)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Canvas Area                                               │
│   width: 100vw    height: 100vh − 80px                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- **Topbar (48px):** Contains breadcrumb bar (32px, inside), Sync button (right-aligned, 32px tall), and Settings icon (right-aligned). Breadcrumb is vertically centred within the topbar.
- **Breadcrumb bar (32px):** Rendered inside the topbar. See `gui/components/navigation/breadcrumb` for full visual spec.
- **Total chrome height:** 80px (48px topbar — but the breadcrumb is embedded inside the topbar, so the full fixed height consumed is 48px. The additional 32px is accounted for as the breadcrumb occupying the lower portion of the topbar. Net formula: canvas height = `100vh − 80px` to leave room for topbar + a 32px safe area below for any future bottom bar or system UI).
- **Canvas area:** Fills remaining space (width: 100vw, height: 100vh − 80px). No internal padding — cards may be positioned anywhere within the logical canvas bounds.

---

## Canvas Coordinate System

- **Logical canvas size:** 4096 × 4096 pixels (virtual space). The visible viewport is a sub-window into this space.
- **Origin (0, 0):** Top-left corner of the logical canvas. Card positions are stored as `{ x, y }` relative to this origin (in canvas pixels, not screen pixels).
- **Initial pan offset:** Viewport is positioned so the primary card is centred in the visible canvas area on first load.
- **Default zoom:** 1.0× (one canvas pixel = one screen pixel at base resolution).

---

## Zoom

| Level   | Scale | Visual treatment                                                     |
|---------|-------|----------------------------------------------------------------------|
| Minimum | 0.2×  | Primary card collapses: only header section (name + UUID) is shown   |
| Default | 1.0×  | Full card: header + description + port section visible               |
| Maximum | 3.0×  | Full card with larger touch targets; no additional content revealed  |

- **Zoom step (scroll wheel):** 0.1× per tick, centred on cursor position.
- **Zoom step (keyboard):** Cmd++ / Cmd+- in 0.25× steps; Cmd+0 resets to 1.0×.
- **Pinch gesture:** Continuous, centred on the midpoint between the two touch points.
- **Zoom centering:** Zoom is always centred on the cursor/pinch point, not the viewport centre. The canvas point under the cursor remains stationary during the zoom gesture.
- **Zoom constraints:** Clamped to [0.2×, 3.0×]. Attempting to zoom beyond these limits produces no change.
- **Viewport persistence:** Current zoom level is saved to `.archui/layout.yaml` under `viewport.zoom` (debounced 300ms after last gesture).

---

## Pan

- **Drag:** Click-and-drag on any empty canvas area (no card hit). Cursor changes to `grabbing` during pan.
- **Two-finger scroll (trackpad):** Translates canvas in the scroll direction.
- **Middle-mouse drag:** Holds middle button and drags.
- **No boundary clamping:** The canvas is logically infinite. There are no hard edges — the user can pan freely in all directions.
- **Auto-fit:** Clicking the `[ ]` (fit) icon in the bottombar resets pan so the primary card is centred with a 10% padding margin. Zoom is adjusted to fit if necessary.
- **Viewport persistence:** Pan offset saved to `.archui/layout.yaml` under `viewport.pan` (debounced 300ms after last gesture event).

---

## Card Layout — Auto-Layout Algorithm

When no `layout.yaml` entry exists for external card positions, the auto-layout algorithm places cards deterministically:

1. **Primary card:** Centred in the viewport (canvas coordinate = viewport_centre − card_size / 2).
2. **Incoming column (left):** External cards that have edges pointing INTO the primary card (or its submodules). Positioned to the left of the primary card.
   - Column x = primary_card.left − 200px − external_card_width
   - Cards stacked vertically: top card at primary_card.top; each subsequent card offset by (external_card_height + 40px).
3. **Outgoing column (right):** External cards that have edges pointing OUT of the primary card (or its submodules). Positioned to the right.
   - Column x = primary_card.right + 200px
   - Same 40px vertical spacing.
4. **Cards with both incoming and outgoing links:** Placed in the column matching their dominant direction (more edges = dominant). Tie → outgoing column.
5. **Collision avoidance:** After initial placement, if any cards overlap (can occur with many cards), each successive card in a column is shifted further down until all cards in that column are non-overlapping.
6. **Auto-layout positions are written to `layout.yaml` on first save** (triggered by the first drag-end or manual position change). Until then, positions are computed in memory each render.

---

## Active Interactions in Idle State

| Interaction | Input | Effect |
|---|---|---|
| Pan canvas | Drag empty space / two-finger scroll / middle-mouse drag | Translates viewport; pan offset written to layout.yaml (debounced) |
| Zoom in/out | Scroll wheel, pinch, Cmd++ / Cmd+- | Scales canvas around cursor/pinch point; zoom level written to layout.yaml (debounced) |
| Select card | Single-click primary card or external reference card | Transition → node-selected; sets `selectedUuid`; detail panel slides in |
| Drill in | Double-click a submodule port row on the primary card | Transition → drilled; pushes drilled module to navStack; canvas re-renders at new level |
| Navigate to external module | Double-click an external reference card | Guard: module must exist in project index. Sets navStack to the external module's parent canvas, highlights the external card briefly (1s pulse) |
| Command palette | Cmd+K | Opens command palette overlay (does not change state); overlay dismissed by Escape or selecting a result |
| Cmd+K select result | Select a result in the command palette | Computes path from current root to target module; sets navStack accordingly; canvas navigates to module's canvas |
| Drag external card | Drag an external reference card | Repositions card on canvas; new position written to `layout.yaml` on mouse-up (single write per drag) |
| Draw link | Drag from a connection handle (◀ or ▶) | Begins edge creation; dragging to another handle and releasing creates a new link entry in the source module's `.archui/index.yaml` |
| Sync | Click Sync button | Opens sync panel overlay (does not change canvas state; overlay layered above canvas) |
