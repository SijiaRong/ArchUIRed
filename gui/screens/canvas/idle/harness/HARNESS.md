---
name: "Canvas — Idle State Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Canvas — Idle State module."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

This playbook verifies pan behavior, zoom behavior, card auto-layout placement, Cmd+K navigation, and the sync panel overlay in the idle canvas state.

---

## Playbook

### Group 1 — Pan Behavior

[init]
- Open any module canvas. State is idle. Note the current canvas pan offset (viewport.pan from layout.yaml or default {x:0, y:0}).

[action]
- Click and drag on empty canvas space (not on any card). Drag 200px to the right and 100px down. Release.

[eval]
- The canvas has translated: all cards have moved 200px left and 100px up relative to their previous screen positions (the viewport panned right and down).
- Cursor was `grabbing` during the drag.
- `.archui/layout.yaml` viewport.pan is updated after the 300ms debounce with the new offset values.

[action]
- Perform a two-finger scroll gesture on a trackpad (simulated as scroll event) — scroll left by 150px.

[eval]
- Canvas pans left by 150px. Same result as drag. No boundary reached — canvas pans freely beyond the logical canvas origin.

[action]
- Click the auto-fit `[ ]` icon in the bottombar.

[eval]
- Viewport resets: primary card is centred in the canvas area with 10% margin. Zoom is adjusted if the primary card was partially out of view.

[end]

---

### Group 2 — Zoom Behavior

[init]
- Open a module canvas. State is idle. Zoom is at 1.0× (default).

[action]
- Position the cursor over the primary card. Scroll down (zoom in) by 5 ticks.

[eval]
- Zoom increases to 1.5×. The canvas point under the cursor has not moved — the view has zoomed in centred on the cursor position, not the viewport centre.

[action]
- Scroll down 20 more ticks (attempting to exceed 3.0×).

[eval]
- Zoom is clamped at 3.0×. Further scroll produces no change. No visual artifact.

[action]
- Press Cmd+0.

[eval]
- Zoom resets to 1.0×. Primary card renders at full size with header, description, and port sections visible.

[action]
- Scroll up 20 ticks (zooming out toward minimum).

[eval]
- Zoom decreases toward 0.2×. At 0.2×, the primary card collapses — only the header section (name + UUID) is visible. Port section and description section are hidden.

[end]

---

### Group 3 — Card Auto-Layout Placement

[init]
- Prepare a module with 3 incoming external links and 2 outgoing external links. Ensure no `layout.yaml` entry exists for this module (delete its entry).
- Open the module's canvas.

[action]
- Observe the initial card placement.

[eval]
- Primary card is centred in the viewport.
- 3 incoming external cards are in a column to the LEFT: column x = primary_card.left − 200px − external_card_width. Cards are spaced 40px apart vertically. No cards overlap.
- 2 outgoing external cards are in a column to the RIGHT: column x = primary_card.right + 200px. Same 40px vertical spacing.

[action]
- Resize the viewport (simulate by zooming to 0.5× so more cards are visible). Confirm the column gap is 200px in canvas coordinates (not screen pixels).

[eval]
- At 0.5× zoom, the visual gap appears 100px on screen, but the underlying canvas coordinate gap remains 200px. Column positions are correct.

[end]

---

### Group 4 — Cmd+K Navigation

[init]
- Open any module canvas. State is idle.

[action]
- Press Cmd+K. The command palette overlay opens.

[eval]
- State remains idle (command palette is an overlay; no state transition fires). The overlay appears above the canvas without dismissing it.

[action]
- Type a module name in the palette search field. Select a result from the list.

[eval]
- The palette dismisses. The canvas navigates: `navStack` is updated to the path from root to the selected module's parent. The target module is visible (as primary card or external reference card). Canvas re-renders at the target level. Breadcrumb updates to match the new navStack.

[action]
- Press Cmd+K again. Press Escape without selecting a result.

[eval]
- Palette dismisses. State remains idle. Canvas is unchanged — no navigation occurred.

[end]

---

### Group 5 — Sync Panel Overlay

[init]
- Open any module canvas. State is idle.

[action]
- Click the Sync button in the topbar (right side).

[eval]
- The sync panel overlay appears above the canvas. Canvas state remains idle — no state transition fires. The canvas is still visible behind the overlay and remains pannable/zoomable.

[action]
- Dismiss the sync panel (click outside or close button).

[eval]
- Overlay dismisses. Canvas is in idle state. Canvas pan and zoom are unchanged by the overlay interaction.

[end]
