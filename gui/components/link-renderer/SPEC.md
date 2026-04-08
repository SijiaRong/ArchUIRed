---
name: Link Renderer
description: "Renders directional edges on the canvas in two categories — direct edges between the primary card's module-level handles and external cards, and port edges between submodule port handles and external cards — with clear arrowheads and a same-card rendering rule."
---

## Overview

The link-renderer draws all directed edges on the canvas. Edges fall into two categories based on which handle they originate from or terminate at on the primary card:

1. **Direct edges** — connect the primary card's module-level handles (on the description section) to external reference cards. These represent links owned by the focused module itself.
2. **Port edges** — connect submodule port handles (in the port section) to external reference cards. These represent links owned by the focused module's submodules.

## Edge Resolution

### Module-level links (→ direct edges)

The focused module's own `links` array is scanned. For each entry:

- **Outgoing:** target UUID resolves to an external module → edge from the module source handle (▶, right side of description section) to the external card.
- **Incoming:** reverse lookup finds external modules that link to the focused module's UUID → edge from the external card to the module target handle (◀, left side of description section).

Module-level handles are only rendered when at least one direct edge exists in that direction. No links = no handles on the description section.

### Submodule-level links (→ port edges)

For each direct submodule of the focused module, its `links` array is scanned:

- **Outgoing:** target UUID resolves to an external module → edge from the submodule's source port (▶) to the external card.
- **Incoming:** reverse lookup finds external modules that link to this submodule → edge from the external card to the submodule's target port (◀).

## Arrow Direction

Every edge has a clear directional arrowhead pointing toward the **passive (target) end** — the module being linked TO.

## Same-Card Rendering Rule

When both endpoints of a link resolve to handles on the same card, the link is **not drawn** at this canvas level. This is a rendering-only decision — the underlying link data is perfectly valid. Submodules may freely link to siblings, to their parent, or vice versa. These links are:

- A link from the focused module to one of its own submodules → both ends on the primary card → **not drawn** here.
- A link between two submodules of the focused module → both ends on the primary card → **not drawn** here.

Such links become visible as cross-card edges when the user drills into the appropriate module.

## Edge Styling

Each edge is styled by its `relation` value — stroke weight, dash pattern, and color vary by relation type. The `relation` field appears as a label at the midpoint of the edge. The `description` field appears as a hover tooltip. Full styling reference is in `resources/edge-reference.md`.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`, `gui/design-system/foundations/spacing/resources/token-table.md`, and `gui/design-system/foundations/elevation/resources/token-table.md` for the complete token vocabulary.

The committed web semantics export for relation defaults is `web-semantics.yaml`; React code must use the generated artifact rather than inventing fallback relation labels inline.
