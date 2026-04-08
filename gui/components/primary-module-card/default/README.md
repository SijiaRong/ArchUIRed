---
name: Primary Module Card — Default State
description: The baseline visual state for both card types — the primary card uses a white/dark background with elevated shadow, while external reference cards use a subtle bordered rectangle; both have neutral styling.
---

## Overview

The default state is the baseline appearance for both card types when the module has no uncommitted changes and is not selected.

### Primary Card — Default

Large card with elevated shadow to distinguish it as the focal element. White (light) or dark-800 (dark) background, 1px border, 12px corner radius.

**Header (fixed height, never collapses):** The colored accent bar has a fixed `min-height` so it does not resize when the title font-size changes on hover. The title uses a large heading size (22 px) at rest. The UUID is always visible at a dimmed opacity (≈ 0.45) below/beside the title using a small mono font — it does not hide at rest.

**Description body (collapsed at rest):** The description section has `max-height: 0; overflow: hidden` at rest, so it takes up zero vertical space and causes no gap between the header and the port section. On hover or selection, it expands (via `max-height` transition) and the title shrinks to a smaller size (13 px). The card can only grow when the body reveals — it never shrinks or deforms.

**Port section:** Separated from the body (or directly from the header at rest) by a 1px dashed divider.

**State:** On hover, the accent border glows. The card size never changes when transitioning from resting to hovered; it only grows downward as the description expands.

### External Reference Card — Default

Compact rectangle with a subtle 1px border, 8px corner radius, and flat (no shadow) appearance. The module name uses `text/primary` at body size. The UUID uses `text/tertiary` at a smaller size than the primary card's UUID, further dimmed to minimize visual distraction.

Visual specifications with annotated diagrams are in `resources/visual-spec.md`.
