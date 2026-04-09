---
name: Canvas — Idle State
description: The default canvas state with no node selected; the detail panel is hidden and all nodes are rendered in their default visual state.
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

Idle is the resting state of the canvas screen. The canvas is fully interactive — pan, zoom, and click all work — but no card is selected and the detail panel is closed. The primary card is rendered in its default or modified/error visual state, all external reference cards are in their default states, and all link edges are drawn. The topbar breadcrumb, sync button, and settings button remain accessible throughout.

State transition table is in `resources/transitions.md`.

## Keyboard Shortcuts and Context Menu Paste

The idle state handles the paste interaction from two entry points:

| Trigger | Guard | Action |
|---------|-------|--------|
| `Cmd/Ctrl+V` | Clipboard content matches `archui://copy?...` regex | Invoke the file-sync layer to duplicate the source module folder into the current canvas level's directory. On completion, re-render the canvas; new node appears at the canvas center or a default position. If validation errors occur after paste, open the agent streaming panel with the repair prompt. |
| Right-click on empty canvas area → "Paste Module" | Clipboard content matches `archui://copy?...` regex | Same action as `Cmd/Ctrl+V` above. The context menu item is disabled (greyed out) when the clipboard does not contain a valid archui:// URI. |
