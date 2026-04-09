---
name: Context Menu
description: The right-click context menu that appears on module cards on the canvas, providing navigation, workspace management, and module copy actions.
---

## Overview

The context menu is a floating overlay panel triggered by right-clicking (or long-pressing on touch) any module card on the canvas. It presents a context-sensitive set of actions based on whether the target card is the primary (root) module or a child module. Items include navigation, workspace management, and clipboard operations. This spec is the authoritative definition of all context menu items and their conditions.

## Menu Items

Items are shown or hidden based on the target node's role in the current view.

| Item | Condition | Action |
|------|-----------|--------|
| Open Module | Target has a resolvable path (any card) | Navigate into the target module (drill-in) |
| Copy Module | Always shown | Write `archui://copy?path=<abs>&uuid=<8hex>` to system clipboard; show a brief "Copied to clipboard" toast |
| New Child Module | Target is the primary (root) module card | Open the New Module dialog to create a direct submodule |
| Reload Workspace | Target is the primary (root) module card | Re-fetch the workspace data from the filesystem |
| Delete Module | Target is NOT the primary (root) module card | Show a confirmation dialog; on confirm, delete the module folder recursively, remove from parent's submodules and layout, clean dangling links project-wide, then reload the canvas. Item uses `danger: true` styling. |

Separators are placed between logical groups: navigation items first, then destructive or workspace-level items.

Delete Module shows a native confirmation dialog before proceeding. The deletion removes the module folder from disk, unregisters it from the parent module's `index.yaml` submodules map and `layout.yaml` positions, and triggers a project-wide sweep to remove any links that reference the deleted module's UUID.

## Trigger & Dismissal

- **Trigger:** Right-click (mouse) or long-press (touch) on any module card
- **Position:** The menu appears at the pointer/touch position
- **Dismiss:** Click outside the menu, press Escape, or select any item

## Design

The menu is a generic, data-driven component that accepts an array of menu items at runtime; it has no knowledge of module semantics. The canvas view constructs the item list based on the target node and passes it to the component. This keeps the UI component reusable for future contexts (e.g., edge right-click, canvas background right-click).

The visual style uses `surface/overlay` background, `1px border/subtle` border, `4px` corner radius, and `elevation/overlay` shadow — consistent with the canvas design system tokens. Danger-flagged items render in a destructive color.

## Platform Clipboard API

Copy Module writes to the system clipboard using the platform-appropriate API:

- Web/Electron: `navigator.clipboard.writeText()`
- iOS: `UIPasteboard.general.string`
- Android: `ClipboardManager.setPrimaryClip()`

## Sub-modules

- **context-menu-harness** — Automated interaction tests covering each conditional item, clipboard write verification, and dismiss behaviors.

## Dependencies

- **Primary Module Card** — Context menu is triggered by right-click events on primary and child module cards on the canvas.
