---
name: "Selection Controller Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Selection Controller module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Selection Controller module.

---

## Playbook

### Group 1: Single-click sets selection; clicking another card replaces it

[init] A canvas is open with at least three primary cards visible. No module is selected (selectedUuid = null). The detail panel is confirmed off-screen.

[action] Single-click Card A.
[eval] Card A enters the selected visual state: accent border and glow applied using color/border/focus. All other cards show no selected state. The detail panel slides in and displays Card A's module data. selectedUuid = Card A's UUID.

[action] Single-click Card B (a different card) without deselecting first.
[eval] Card A returns to its default (unselected) visual state. Card B enters the selected visual state. The detail panel remains visible and updates its content to display Card B's module data. selectedUuid = Card B's UUID. There is no moment where two cards are simultaneously selected.

[action] Single-click Card B again (same card, already selected).
[eval] Card B remains in the selected visual state. The detail panel remains open showing Card B's data. selectedUuid is unchanged (still Card B's UUID). No toggle or deselect occurs on repeated click of the same card.

[end] Click empty canvas to deselect. Confirm selectedUuid = null and all cards are in default state.

---

### Group 2: Canvas pane click clears selection

[init] A canvas is open. Card A is selected (selectedUuid = Card A's UUID). The detail panel is visible. The onPaneClick handler is wired to selectModule(null).

[action] Click on an empty area of the canvas background where no node, edge, or handle is present.
[eval] selectedUuid becomes null. Card A returns to default visual state (no accent border, no glow). The detail panel slides out to translateX(100%) over 200ms.

[action] Single-click Card A again to restore selection, then click on a canvas edge (link line) rather than empty space.
[eval] Clicking a canvas edge does NOT clear the selection — onPaneClick does not fire when the click target is an edge. selectedUuid remains Card A's UUID. The detail panel remains visible.

[action] Single-click Card A again (still selected), then click directly on Card A's body.
[eval] Clicking the card body fires the node's onClick handler, not onPaneClick. selectedUuid remains Card A's UUID (or re-sets to it). Selection is not cleared.

[end] Click empty canvas to clear selection. Confirm selectedUuid = null.

---

### Group 3: Drill-in navigation resets selectedUuid to null

[init] A canvas is open. Card A is selected (selectedUuid = Card A's UUID). The detail panel is visible. Card A has at least one submodule (so drill-in is possible).

[action] Double-click Card A (the drill-in gesture).
[eval] The canvas navigates into Card A's level: the canvas re-renders showing Card A's submodules as the new set of nodes. The breadcrumb updates to include Card A. selectedUuid is reset to null. The detail panel slides out (translateX(100%)).

[action] Confirm the new canvas level by observing the breadcrumb and the visible nodes.
[eval] The breadcrumb shows the path ending at Card A. The nodes displayed are Card A's submodules, not the original parent-level cards.

[end] Click the breadcrumb to navigate back to the parent level. Confirm selectedUuid = null and the original cards are visible.

---

### Group 4: Port row click selects the submodule's UUID

[init] A canvas is open. Primary Card P is visible and has port rows for its submodules (Submodule S1, Submodule S2). No module is selected.

[action] Single-click the port row for Submodule S1 inside Card P.
[eval] selectedUuid = S1's UUID. The port row for S1 is highlighted (accent color on row background or left border stripe). The detail panel slides in and displays S1's module data (S1's name, UUID, description, and its own submodules/links if any).

[action] Single-click the port row for Submodule S2.
[eval] selectedUuid changes to S2's UUID. The S1 port row loses its highlight. The S2 port row becomes highlighted. The detail panel updates to show S2's data.

[action] Click empty canvas.
[eval] selectedUuid = null. All port row highlights are removed. Detail panel slides out.

[end] Confirm all cards and port rows are in their default unselected state.

---

### Group 5: Breadcrumb navigation resets selectedUuid to null

[init] A canvas has been navigated into a nested module level (e.g., Root → Module A → Submodule B). A card at the current level (Submodule B's child) is selected, so selectedUuid is non-null. The detail panel is visible.

[action] Click the "Module A" entry in the breadcrumb trail to navigate up one level.
[eval] The canvas navigates back to Module A's level. The nodes displayed are Module A's submodules. selectedUuid is reset to null. The detail panel slides out. The breadcrumb updates to show Root → Module A.

[action] Confirm that no card at the new level appears selected.
[eval] All cards at Module A's level are in their default visual state. No accent border or glow is present on any card.

[action] Click the root breadcrumb entry to navigate to the root level.
[eval] The canvas renders the root-level modules. selectedUuid remains null. The detail panel remains off-screen.

[end] Confirm the canvas is at the root level with no card selected and the detail panel hidden.
