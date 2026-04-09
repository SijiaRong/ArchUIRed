---
name: Canvas — Node Selected State
description: The canvas state when exactly one module node is selected; the detail panel is visible on the right showing the selected module's frontmatter and file metadata.
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

Node-selected is the state when a user has single-clicked a card (either the primary card or an external reference card). The selected card is highlighted (using the `module-node/selected` visual state — highlighted border and elevated shadow) and the detail panel slides in from the right. All idle-state canvas interactions remain active alongside the selection.

The detail panel (`gui/components/detail-panel`) shows the module name (tinted with its card accent color), UUID, description, submodule list, outgoing links (Link to), and incoming links (Linked by). Each row is interactive and navigates the canvas on click.

State transition table is in `resources/transitions.md`.

## Keyboard Shortcuts

In addition to the transitions listed in `resources/transitions.md`, the node-selected state handles the following keyboard interactions:

| Shortcut | Guard | Action |
|----------|-------|--------|
| `Cmd/Ctrl+C` | `selectedUuid` is non-null | Write `archui://copy?path=<abs-path>&uuid=<8hex>` to the system clipboard. Show a brief toast notification "Copied to clipboard". No state transition — remains in node-selected. |
| `Cmd/Ctrl+V` | Clipboard content matches `archui://copy?...` regex | Invoke the file-sync layer to duplicate the source module folder into the current canvas level's directory. On completion, re-render the canvas; new node appears. If errors occur, open the agent streaming panel with the repair prompt. No state transition — remains in node-selected. |
