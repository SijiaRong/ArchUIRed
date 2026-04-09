---
name: "Primary Module Card — Selected State Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Primary Module Card — Selected State module."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

This playbook verifies the behaviour and structural constraints defined in the Primary Module Card — Selected State module.

---

## Playbook

### Group 1: Single-click selects the card and applies the correct visual treatment

[init] A canvas is open with at least one primary card visible. No card is currently selected.

[action] Single-click the primary card body.
[eval] The card border changes to 2px solid `color/border/focus` (blue). The background shifts to `color/interactive/selected-bg`. The box-shadow gains the focus ring: `0 0 0 3px rgba(37,99,235,0.20)` plus the standard drop shadow. The drill-in [↗] icon becomes fully visible (opacity 1.0).

[action] Observe the description section.
[eval] The description section is fully expanded (52px height) regardless of whether the cursor is hovering over the card.

[action] Observe the module-level handles (if the module has module-level links).
[eval] The target (◀) and/or source (▶) handles on the description section edges are permanently visible — not gated by hover.

[end] Click empty canvas to deselect. Confirm card returns to default visual state.

### Group 2: Detail panel opens on selection

[init] A canvas is open. The detail panel is not visible. No card is selected.

[action] Single-click a primary card.
[eval] The detail panel slides in from the right viewport edge with a `translateX(100%) → translateX(0)` animation (180ms, ease-out). On desktop the panel is 320px wide. The panel displays the focused module's name, UUID, and description content.

[action] Press the Escape key.
[eval] The detail panel closes (reverse animation: translateX(0) → translateX(100%), ~150ms ease-in). The card returns to its default visual state (1px border, no focus ring, description collapses if cursor is not hovering).

[end] No cleanup required.

### Group 3: Selection is mutually exclusive across all cards

[init] A canvas is open with at least two cards visible (primary card and one external reference card). No card is selected.

[action] Single-click the primary card.
[eval] The primary card enters the selected state (2px blue border, focus ring, expanded description).

[action] Single-click an external reference card.
[eval] The external reference card enters the selected state (2px blue border, focus ring). The primary card simultaneously returns to its default state (1px subtle border, no focus ring). At most one card is selected at any time.

[action] Click on an empty area of the canvas.
[eval] The external reference card deselects and returns to default state. No card is selected. The detail panel closes.

[end] No cleanup required.

### Group 4: Selected external reference card shows correct visual treatment

[init] A canvas is open with at least one external reference card visible. No card is selected.

[action] Single-click an external reference card.
[eval] The external card border changes to 2px solid `color/border/focus`. The background shifts to `color/interactive/selected-bg`. The box-shadow becomes `0 0 0 3px rgba(37,99,235,0.20)` (focus ring only, no drop shadow). The card's single connection handle is permanently visible.

[action] Observe that the external card's typography is unchanged.
[eval] Module name remains `typography/node-name` in `color/text/primary`. UUID remains `typography/ui-meta` in `color/text/tertiary`. No other visual properties change.

[end] Click empty canvas to deselect.

### Group 5: Combined selected + modified state

[init] A canvas is open. A module has uncommitted git changes (modified state). The card shows an amber header and amber status dot.

[action] Single-click the modified card.
[eval] The card enters a combined state: the border is 2px solid `color/border/focus` (selection takes precedence over default border). The background is `color/interactive/selected-bg`. The header retains its amber background tint and the 2px amber bottom accent bar. The status dot remains amber (`color/status/modified`). The box-shadow is `elevation/card/selected`.

[action] Press Escape.
[eval] The card returns to the modified state only (amber header, no focus ring, 1px border, no selected-bg).

[end] No cleanup required.
