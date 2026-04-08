---
name: Primary Module Card
description: "Visual card component for the ArchUI canvas — a large card for each module rendered at the current level, with title, UUID, description, and port rows for outgoing links. No external reference cards; cross-hierarchy links are surfaced in the detail panel only."
---

## Architecture Note

This spec describes the **single-primary-card** canvas model: one large card per level (the focused module), with children surfaced as port rows within it.

The **web platform** (`web-development-release/web-dev/`) uses a **multi-card** model instead: each child module renders as its own card, and port rows on each card show the card's outgoing link targets (not submodule names). See `web-development-release/web-dev/SPEC.md` for the authoritative web canvas architecture.

These two models are intentional divergences for different presentation contexts. This spec remains the reference for future native platform implementations (iOS, Android) or if the web canvas is ever refactored to the single-primary-card model.

---

## Overview

The canvas renders one large module card per direct child of the current level. There are no small external reference cards — links to modules outside the current hierarchy are visible only in the detail panel (LINK TO / LINKED BY sections). Only sibling-to-sibling edges are drawn on the canvas.

## Module Card

Each card represents one child module at the current canvas level. It is organized into distinct sections from top to bottom:

### Header Section

1. **Module name** — displayed as the card title (prominent heading).
2. **UUID** — a small, dimmed identifier below or beside the title.

### Description Section

3. **Description** — the `description` field from frontmatter, displayed as body text.
4. **Connection handles** — a target handle (◀) on the left edge and a source handle (▶) on the right edge, always present for React Flow edge connections.

### Port Section

5. **Outgoing link port rows** — one row per entry in the module's `links` array. Each row shows the **target module's name** (resolved from siblings at the current level; falls back to 8-char UUID for cross-hierarchy links). A source handle (▶) on the right edge of each row allows edges to originate from the specific link.

### Command Bar

6. **Command bar** — a row of action buttons at the bottom of the card. Rendered only when the module has one or more files in `.archui/commands/`. Each button corresponds to one command file; clicking it invokes the AI agent with that command's skill body. See `command-bar` for full rendering and interaction spec.

Cards are draggable. Their positions are persisted in `.archui/layout.yaml`. Single-clicking a card selects it and opens the detail panel. Double-clicking drills into the module.

## External Links

Links to modules outside the current canvas level are **not rendered as stub cards**. They are:

- Shown as port rows on the source card (with UUID fallback label when name is unresolvable).
- Fully visible in the detail panel's **LINK TO** and **LINKED BY** sections when the card is selected.

Edges for cross-hierarchy links are not drawn on the canvas — only sibling-to-sibling edges are drawn.

## Same-Level Rendering Rule

Only edges where **both source and target are siblings** at the current canvas level are drawn. Links to modules at other levels become visible when the user navigates to the level where both endpoints are siblings.

## Non-Overlap Constraint

All cards must never overlap on the canvas. The layout engine enforces collision-free placement during initial layout and drag operations.

## State Variants

Both card types share visual state variants: default (clean), modified (amber accent), and error (red border, frontmatter unparseable). Each variant has a dedicated submodule describing its visual properties.

## Positioning

External card positions are stored in `.archui/layout.yaml` relative to the parent canvas. Moving an external card never changes the folder structure.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`, `gui/design-system/foundations/spacing/resources/token-table.md`, and `gui/design-system/foundations/elevation/resources/token-table.md` for the complete token vocabulary.

The committed web copy export for card semantics is `web-copy.yaml`; node eyebrow labels and card badge nouns must flow through the generated artifact rather than being hardcoded in React node components.
