---
name: Primary Module Card — Port Section
description: "The submodule port list inside the primary card, showing externally-linked child modules as rows with target (left) and source (right) connection handles for link edges."
---

## Overview

The port section occupies the lower area of the primary card, below the description body and separated by a horizontal divider. It lists every direct submodule of the focused module that has at least one link to or from a module outside the current hierarchy.

## Port Row Layout

Each port row displays the submodule's name and exposes connection handles:

- **Target port (◀)** — a handle on the left edge of the primary card, aligned to this row. External modules that link TO this submodule connect here. The arrow on the link edge points toward this handle.
- **Source port (▶)** — a handle on the right edge of the primary card, aligned to this row. This submodule's outgoing links to external modules originate here. The arrow on the link edge points away from this handle.

A submodule can have both a target port and a source port if it has both incoming and outgoing external links.

## Filtering

Only submodules with at least one external link appear in the port section. Submodules that link only to siblings within the same parent (which would be visible only at the drilled-in level) are omitted from the port list to reduce visual noise.

## Interaction

Double-clicking a port row drills into that submodule, making it the new primary card on the canvas.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Port label colors must use the `color/port/*` palette defined in `gui/design-system/foundations/color/resources/token-table.md`. Consult the full token vocabulary in `gui/design-system/foundations/` for all other visual properties.
