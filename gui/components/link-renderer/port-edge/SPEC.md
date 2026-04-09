---
name: Link Renderer — Port Edge
description: "The primary edge type in the current rendering model — connects a submodule port handle on the primary card to an external reference card, with a directional arrowhead pointing toward the passive target end."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

A port edge connects a submodule's port handle on the primary card to an external reference card. This is the primary (and currently only active) edge type rendered on the canvas.

## Outgoing Port Edge

When a submodule links to an external module, the edge routes from the submodule's source port (▶, right edge of primary card) to the external reference card's target handle (left edge). The arrowhead points at the external card.

## Incoming Port Edge

When an external module links to a submodule, the edge routes from the external reference card's source handle (right edge) to the submodule's target port (◀, left edge of primary card). The arrowhead points at the target port.

## Visual Properties

- **Stroke:** varies by relation type (see edge-reference.md for the full style table).
- **Arrowhead:** always present at the passive (target) end — clear and prominent.
- **Relation label:** rendered at the midpoint of the edge (only when `relation` is set).
- **Tooltip:** on hover, shows the `description` field from the link entry.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Edge stroke colors are defined in `gui/design-system/foundations/color/resources/token-table.md` under `color/edge/*`. Consult the full token vocabulary in `gui/design-system/foundations/` for all other visual properties.
