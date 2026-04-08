---
name: Primary Module Card
description: "Visual card components for the ArchUI canvas — a large primary card for the focused module (with title, UUID, description section with module-level handles, and submodule port rows) and a small external reference card for linked modules outside the current hierarchy."
---

## Overview

Module-node encompasses two card variants rendered on the canvas. Each rendering level has exactly one primary card (the focused module) and zero or more external reference cards (linked modules outside the hierarchy).

## Primary Card

The primary card is the large card representing the currently focused module. It is organized into distinct sections from top to bottom:

### Header Section

1. **Module name** — displayed as the card title (prominent heading).
2. **UUID** — a small, dimmed identifier below or beside the title.

### Description Section

3. **Description** — the `description` field from frontmatter, displayed as body text.
4. **Module-level handles** — connection handles on the left and right edges of the description section for the focused module's own links (links in its own `links` array). A **target handle** (◀) appears on the left edge when external modules link TO this module. A **source handle** (▶) appears on the right edge when this module links OUT to external modules. These handles are hidden when no module-level links exist in that direction.

### Port Section

5. **Submodule port list** — a list of child modules that have external links. Each submodule row shows the submodule name and exposes connection handles: a **target port** (◀) on the left edge for incoming links, and a **source port** (▶) on the right edge for outgoing links. Only submodules with at least one external link are shown in the port list.

### Command Bar

6. **Command bar** — a row of action buttons at the bottom of the primary card. Rendered only when the module has one or more files in `.archui/commands/`. Each button corresponds to one command file; clicking it invokes the AI agent with that command's skill body. See `command-bar` for full rendering and interaction spec.

The primary card is not draggable (it is anchored as the level's focal element). Double-clicking a submodule row in the port list drills into that submodule, making it the new primary card.

## External Reference Card

A small rectangular card representing a module that is linked to or from the focused module (at either module level or submodule level) but does not belong to the current module hierarchy. It contains:

1. **Full module name** — displayed as a compact label.
2. **UUID** — a smaller, more dimmed identifier below the name.

External cards are draggable. Their positions are persisted in `.archui/layout.yaml`. Single-clicking an external card selects it and shows the detail panel. Double-clicking an external card navigates to the canvas level where that module is the primary card (or a submodule of the primary card).

## Connection Handles

The primary card exposes two kinds of connection handles:

- **Module-level handles** — on the left/right edges of the description section, for the focused module's own links. Only shown when links exist in that direction.
- **Submodule port handles** — on the left/right edges of each submodule port row, for submodule links.

Each external reference card has a single default handle on the left or right edge, depending on link direction.

## Same-Card Rendering Rule

When both endpoints of a link resolve to handles on the same card, the link is **not drawn** at this canvas level — it is a rendering-only rule, not a data model restriction. Submodules are fully allowed to link to each other, to their parent, or vice versa. Such links simply become visible as cross-card edges when the user drills into the appropriate module.

## Non-Overlap Constraint

All cards — primary and external — must never overlap on the canvas. The layout engine enforces collision-free placement during initial layout and drag operations.

## State Variants

Both card types share visual state variants: default (clean), modified (amber accent), and error (red border, frontmatter unparseable). Each variant has a dedicated submodule describing its visual properties.

## Positioning

External card positions are stored in `.archui/layout.yaml` relative to the parent canvas. Moving an external card never changes the folder structure.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`, `gui/design-system/foundations/spacing/resources/token-table.md`, and `gui/design-system/foundations/elevation/resources/token-table.md` for the complete token vocabulary.

The committed web copy export for card semantics is `web-copy.yaml`; node eyebrow labels and card badge nouns must flow through the generated artifact rather than being hardcoded in React node components.
