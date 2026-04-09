---
name: "Link Renderer — External Stub (Deprecated) Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Link Renderer — External Stub (Deprecated) module."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

This playbook verifies the behaviour and structural constraints defined in the Link Renderer — External Stub (Deprecated) module.

---

## Playbook

### Group 1: External reference card appears for each unique cross-boundary link

[init] A canvas is open. The focused module has two submodules: Sub-A (links to Module X with `depends-on`) and Sub-B (links to Module X with `references`). Module X is not a submodule of the focused module.

[action] Observe the canvas for external reference cards.
[eval] Exactly one external reference card is rendered for Module X — not two. The card shows Module X's `name` in 13px semi-bold and its UUID in 10px mono dimmed text. Two port edges connect to this single card: one from Sub-A's port row and one from Sub-B's port row.

[end] No state change needed; canvas remains open.

---

### Group 2: External reference card data display

[init] A canvas is open with an external reference card for a module named "Navigation" with UUID `f7a2b91c`.

[action] Observe the external reference card.
[eval] The card shows "Navigation" in `text/primary` styling (13px semi-bold) on the first line, and "f7a2b91c" in `text/tertiary` styling (10px mono, visually dimmed) on the second line. No description, no submodule list, and no port rows are shown. The card has a flat (no shadow) appearance with an 8px corner radius and a 1px `color/border/subtle` border.

[end] No state change needed; canvas remains open.

---

### Group 3: Drag behavior — card repositions and edges follow

[init] A canvas is open with an external reference card for Module X positioned to the right of the primary card. A port edge connects Sub-A's port row to Module X.

[action] Click and drag the external reference card for Module X to a new position above the primary card.
[eval] The external reference card moves to the new position. The port edge bezier curve updates in real time as the card is dragged — it recalculates to keep the shaft connected to Sub-A's port handle and to Module X's new anchor position. The edge does not snap to its old position.

[action] Release the drag.
[eval] The external reference card remains at the new position. The bezier curve settles in its recalculated shape. The card position is persisted in canvas layout state.

[end] No state change needed; canvas remains at the updated position.

---

### Group 4: Single click selects card, double-click navigates

[init] A canvas is open with an external reference card for Module Y.

[action] Single-click the external reference card for Module Y.
[eval] The card becomes selected: its border changes to 1.5px `color/accent/primary`. All edges connected to Module Y highlight. No navigation occurs — the focused module does not change.

[action] Click elsewhere on the canvas.
[eval] Module Y's card deselects and returns to its default border style. Connected edges return to their default colors.

[action] Double-click the external reference card for Module Y.
[eval] Navigation occurs: the canvas rebuilds around Module Y as the new focused module. Module Y's primary card is now the central card. The breadcrumb trail updates to show the new path.

[end] Navigate back to the original focused module using the breadcrumb trail.

---

### Group 5: No external reference card when all links are same-card

[init] A canvas is open. The focused module has one submodule Sub-A, and Sub-A links to another submodule Sub-B of the same focused module. No links cross outside the focused module's boundary.

[action] Observe the canvas for external reference cards.
[eval] No external reference cards are rendered. The canvas shows only the primary card. The Sub-A → Sub-B link is suppressed by the same-card rule and does not trigger creation of an external reference card.

[end] No state change needed; canvas remains open.
