---
name: Selection Controller
description: "Defines the selection model for the canvas: how modules become selected (single click on any card), how selection is cleared (click on empty canvas), and how selected state propagates to the primary card visual and the detail panel."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

Selection is a single-value global state: at most one module UUID is selected at any time. The selection controller owns this state and is the single source of truth for which module (if any) is currently selected.

## Selection State

```
selectedUuid: string | null
```

- `null` — no module selected (canvas is in idle state)
- `<uuid>` — exactly one module is selected

## Setting Selection

Selection is set by a **single click** on any of the following:

| Target | Result |
|---|---|
| Primary card body or header (not the drill-in button) | Select that primary card's module |
| External reference card | Select the external module |
| Port row inside the primary card | Select the submodule shown by that port row |
| Detail panel submodule row click | Select the clicked submodule (and navigate) |
| Detail panel link row click | Select the linked module (and navigate) |

Double-click on a card triggers **drill-in navigation** and does NOT change `selectedUuid` (drill-in replaces the canvas level entirely).

## Clearing Selection

Selection is cleared when the user clicks on **empty canvas space** — any click on the React Flow pane background that does not land on a node, edge, or handle. This sets `selectedUuid` to `null`.

There is no explicit "Escape" key handler for deselection (may be added later). Navigating to a new canvas level (drill-in or breadcrumb click) resets `selectedUuid` to `null` as part of the level transition.

## Effects of Selection

When `selectedUuid` changes:

| Component | Response |
|---|---|
| Primary card (`module-node`) | If its UUID matches: apply `primaryNodeSelected` CSS (accent border + glow) |
| External reference card | If its UUID matches: apply selected visual state |
| Port row | If its port UUID matches: highlight that row |
| Detail panel | Non-null → slides in and displays the selected module; null → slides out |

## Canvas Click Deselection

The React Flow `onPaneClick` event fires when the user clicks on the canvas background with no node or edge under the cursor. The handler sets `selectedUuid = null`.

```typescript
onPaneClick={() => selectModule(null)}
```

React Flow guarantees `onPaneClick` does not fire when clicking a node or edge — the node's `onClick` handler fires instead and stops propagation to the pane.

## Interaction with Navigation

When the user navigates (drill-in, breadcrumb, or detail panel row click):

1. Navigate to the new canvas level.
2. Set `selectedUuid` to the UUID of the target module (if the navigation was triggered by selecting a specific target) OR to `null` (if triggered by a breadcrumb or drill-in with no specific target).
3. After the new canvas level renders, scroll/centre the selected module into view if a target UUID was specified.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`, `gui/design-system/foundations/spacing/resources/token-table.md`, and `gui/design-system/foundations/elevation/resources/token-table.md` for the complete token vocabulary.
