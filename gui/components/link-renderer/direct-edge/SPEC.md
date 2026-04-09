---
name: Link Renderer — Direct Edge
description: "An edge between the primary card's module-level handle (on the description section) and an external reference card, representing a link owned by the focused module itself rather than by a submodule."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

A direct edge connects the focused module's own connection handle (on the primary card's description section) to an external reference card. This edge type represents links in the focused module's own `links` array — as opposed to port edges which represent links owned by submodules.

## Outgoing Direct Edge

When the focused module itself links to an external module, the edge routes from the **module source handle** (▶, right edge of the description section) to the external reference card's target handle (left edge). The arrowhead points at the external card.

## Incoming Direct Edge

When an external module links to the focused module itself, the edge routes from the external reference card's source handle (right edge) to the **module target handle** (◀, left edge of the description section). The arrowhead points at the module target handle.

## Handle Visibility

Module-level handles on the description section are only rendered when at least one direct edge exists in that direction. If the focused module has no outgoing links to external modules, the right-side handle (▶) is hidden. If no external modules link to the focused module, the left-side handle (◀) is hidden.

## Visual Properties

- **Stroke:** varies by relation type (see edge-reference.md for the full style table).
- **Arrowhead:** always present at the passive (target) end — clear and prominent.
- **Relation label:** rendered at the midpoint of the edge (only when `relation` is set).
- **Tooltip:** on hover, shows the `description` field from the link entry.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Edge stroke colors are defined in `gui/design-system/foundations/color/resources/token-table.md` under `color/edge/*`. Consult the full token vocabulary in `gui/design-system/foundations/` for all other visual properties.
