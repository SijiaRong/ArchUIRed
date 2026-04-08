---
name: Navigation
description: "Manages drill-down navigation between module canvases, maintaining a breadcrumb trail and enabling back-navigation to parent modules."
---

## Overview

Navigation is responsible for moving between canvases in the ArchUI GUI. Because each canvas level renders one module as a primary card, navigating the knowledge base means moving up and down the module tree. Navigation maintains the session's position as a stack of module UUIDs mapping directly to a filesystem path.

## Navigation Model

The navigation state is a stack: drilling into a module pushes it, going back pops the top. The stack maps directly to a filesystem path — `[ root ] → [ gui ] → [ canvas ]` corresponds to `/archui/gui/canvas/`.

## Breadcrumb Trail

The breadcrumb trail is always visible at the top of the viewport, rendering the navigation stack as a horizontal sequence of clickable crumbs. Clicking any crumb navigates directly to that depth, not just one step back. The root crumb ("ArchUI") is always present and never removed.

## Drill-In and Back Navigation

Drill-in is triggered by double-clicking a submodule port row on the primary card, clicking the `[↗]` icon on a node header, or double-clicking an external reference card (which navigates to the canvas where that module lives). Back navigation is triggered by the back button, `Escape` or `Backspace` (when no card is selected), or clicking a parent crumb. The previously focused module is briefly highlighted on return to help re-orientation.

## Jump Navigation

The command palette (`Cmd+K` / `Ctrl+K`) provides fuzzy search across all modules using `.archui/index.yaml`. Selecting a result computes the path from root, sets the navigation stack, and renders the parent canvas with the target node highlighted.

## Session Persistence

The current navigation stack is persisted in browser/app session storage so the user returns to the last active canvas on reload. This is a session hint only — it does not affect filesystem state.

## Layout File

Canvas card positions are stored in `.archui/layout.yaml`. The schema and writer rules are in `resources/layout-yaml-schema.md`.
