---
name: "Canvas Screen Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Canvas Screen module."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

This playbook verifies the full canvas state machine traversal, card layout initialization, and layout.yaml persistence across the three canvas states (idle, node-selected, drilled).

---

## Playbook

### Group 1 — Full State Machine Traversal (idle → node-selected → drilled → back)

[init]
- Open a project with at least two levels of nesting (e.g. root → GUI → Canvas).
- Navigate to the root module canvas. Confirm state is idle: no card is selected, detail panel is hidden.

[action]
- Single-click the "GUI" external reference card on the root canvas.

[eval]
- State is node-selected. The detail panel slides in from the right (320px wide). The "GUI" card displays a 2px blue border and elevated glow shadow. `selectedUuid` equals the GUI module UUID.

[action]
- Double-click a submodule port row on the primary card (e.g. "Canvas" port row pointing to the Canvas module).

[eval]
- State transitions to drilled. The 200ms entry animation plays: the primary card expands and fades, the new canvas fades in. Breadcrumb now shows one additional crumb. The detail panel is dismissed. `selectedUuid` is null. `navStack` has grown by one.

[action]
- Press Escape with no card selected.

[eval]
- State returns to the parent canvas level. The previously drilled card receives a 500ms pulse highlight. Breadcrumb shrinks by one crumb. `navStack` is one entry shorter.

[end]
- Project state unchanged. No files were written beyond layout.yaml (auto-layout save).

---

### Group 2 — Card Auto-Layout on First Open

[init]
- Open a module that has no existing entry in `.archui/layout.yaml` (delete or comment out its entry if one exists before the test).
- Navigate to that module's canvas.

[action]
- Observe the initial placement of the primary card and external reference cards.

[eval]
- Primary card is centred in the viewport.
- Incoming external cards appear in a column to the left of the primary card, with a 200px gap from the primary card's left edge and 40px vertical spacing between cards.
- Outgoing external cards appear in a column to the right, 200px from the primary card's right edge, 40px vertical spacing.
- No two cards overlap.

[action]
- Drag one external card to a new position and release (mouse-up / touch-end).

[eval]
- `.archui/layout.yaml` now contains an entry for this module UUID under `nodes`, with the dragged card's new `{ x, y }` coordinates recorded. All other cards' positions are also written (auto-layout positions persisted on first save).

[end]

---

### Group 3 — layout.yaml Persistence Across Sessions

[init]
- Open a canvas that already has a saved layout (`.archui/layout.yaml` contains an entry for the module UUID).
- Note the positions and viewport zoom/pan values.

[action]
- Close and reopen the project (or navigate away and back to the same canvas).

[eval]
- Card positions are restored exactly from `layout.yaml`. Viewport zoom and pan are restored to the saved values.
- No auto-layout recalculation occurs (cards appear at their saved positions, not at auto-layout default positions).

[action]
- Zoom in using Cmd++ and then pan by dragging the canvas. Wait 300ms after the last gesture.

[eval]
- `.archui/layout.yaml` is updated with the new `viewport.zoom` and `viewport.pan` values for this canvas. The write is debounced: only one write occurs after a flurry of zoom/pan events, not one per frame.

[end]

---

### Group 4 — Same-Card Link Suppression

[init]
- Set up a module where two of its submodules link to each other (sibling-to-sibling link). Navigate to the parent module's canvas.

[action]
- Observe edges on the canvas.

[eval]
- No edge is drawn between the two sibling submodule port rows (both endpoints resolve to the same primary card). The canvas renders without an intra-card edge.
- The link data is valid — navigating into the parent module should reveal the sibling link as a cross-card edge.

[action]
- Drill into the parent module (double-click the sibling's port row).

[eval]
- At the new level, the sibling link now appears as an edge between the two modules. The link is drawn correctly with a directional arrowhead.

[end]

---

### Group 5 — Non-Overlap Constraint During Drag

[init]
- Open a canvas with multiple external reference cards close together.

[action]
- Drag an external card directly on top of another external card and release.

[eval]
- The layout engine prevents the overlap. Either the dragged card snaps to the nearest non-overlapping position, or it is pushed to a position that maintains a minimum gap. No two card bounding boxes intersect after the drag-end.
- The saved position in `layout.yaml` reflects the adjusted (non-overlapping) position, not the raw drop position.

[end]
