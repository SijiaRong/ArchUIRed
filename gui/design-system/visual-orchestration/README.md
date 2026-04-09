---
name: Visual Orchestration
description: "Defines the canvas composition grammar, node hierarchy, panel layout, density rules, and motion language that translate reference UIs such as ComfyUI into ArchUI's Figma-first GUI system."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

Visual Orchestration sits between token foundations and concrete component specs. It defines how ArchUI should feel as a workspace: canvas density, layering, node emphasis, edge readability, panel hierarchy, focus management, and motion. It is the place to translate inspiration or reverse-engineering input from external tools into ArchUI-native design rules without making those tools the source of truth.

## Purpose

Reverse-engineering a reference UI like ComfyUI should produce a visual delta, not direct code or CSS reuse. That delta is normalized here first, then pushed into Figma components and canvas layouts. Figma remains the canonical design source; this module captures the semantic decisions that explain why the Figma update exists.

## Orchestration Axes

- **Canvas composition** - background treatment, grid visibility, zoom behavior, whitespace policy, and collision/readability rules at different graph densities.
- **Node family hierarchy** - the contrast model between the focused primary card, external reference cards, selected states, modified/error states, and any future grouped or queued node families.
- **Type hierarchy** - wordmark, heading sans, UI sans, and mono identifiers must be assigned intentionally so workspace character comes from clear roles rather than ad hoc font overrides.
- **Edge language** - routing, stroke emphasis, arrowhead prominence, relation labeling density, and rules for dense-link scenes.
- **Panel hierarchy** - breadcrumb, detail panel, command surfaces, and any secondary workbench panels must read as one workspace system rather than disconnected widgets.
- **Motion and focus** - transitions for pan/zoom, selection, drill-in, panel reveal, and returning from deep navigation must preserve spatial orientation.
- **Evidence intake** - browser inspection artifacts, Playwright captures, Chrome DevTools notes, and Figma redlines are accepted as inputs, but they must be rewritten as ArchUI rules before implementation begins.

## Relationship To Figma And Code

The workflow is: reference evidence -> visual orchestration decision -> Figma update -> document-layer export -> platform implementation -> screenshot verification. For the web wave, the committed orchestration exports are `web-layout.yaml` and `web-brand.yaml`, which are consumed by `npm run sync:design-docs` and rendered into generated layout and brand-asset artifacts. Web and Electron share the same SPA implementation wave; Electron-specific work begins only where the native shell changes behavior rather than presentation.

Brand marks belong here when they express workspace character rather than plain typography. The current landing/header `A` mark is defined as a custom vector asset: rounded modular geometry, forward lean, Deep Honey single-color treatment, and explicit `sm` / `md` / `hero` sizing. It must be previewed in Figma and exported into repo-owned assets; it is never implemented as a downloaded font glyph.

## Applies To

- `gui/screens/canvas`
- `gui/components/primary-module-card`
- `gui/components/link-renderer`
- `gui/components/navigation`
- `gui/components/detail-panel`
- `web-development-release/web-dev`
- `web-development-release/web-test`
