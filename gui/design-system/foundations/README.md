---
name: Foundations
description: "The complete design token vocabulary for ArchUI — semantic color, typography, spacing, and elevation tokens that all platform implementations must map to their native styling system."
---

## Overview

Foundations defines every primitive and semantic design token used across the ArchUI GUI. A token name like `color/surface/default` is stable across all platforms — only the rendering format changes. Token values are never hand-edited in platform code; update Figma first, then regenerate via the `figma-integration` workflow.

All token names follow a `category/role/variant` path structure where category is `color`, `spacing`, `typography`, or `elevation`; role is the UI element or purpose; and variant is an optional modifier for emphasis level, state, or mode.

## Token Categories

- **color** — Semantic color tokens for surfaces, text, edges (by relation type), status indicators, and interactive states in Light and Dark modes.
- **typography** — Named text styles with font family, size, weight, and line-height for every text role.
- **spacing** — 8px-grid spacing scale and fixed dimension tokens for component geometry.
- **elevation** — Drop-shadow effect tokens encoding four visual depth levels.

Each category has a dedicated submodule with full token specifications and platform mapping details.

## Figma Source

The canonical source is the `Foundations` page in the Figma file (key `beEbYQhz9LBLHrAj2eGyft`). Tokens are organised into three variable collections (`Color`, `Spacing`, `Dimension`) plus local text styles and effect styles. Platform implementations consume checked-in export snapshots such as `web-token-export.yaml`; those snapshots are regenerated from Figma and then rendered into platform-native artifacts.
