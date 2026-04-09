---
name: Detail Panel
description: "The slide-in right panel that appears when a module is selected — displays the module's title (tinted with its card accent color), UUID, description, submodule list, outgoing links (Link to), and incoming links (Linked by); each row is interactive and navigates the canvas."
---

## Overview

The detail panel is a fixed-width panel anchored to the right edge of the canvas viewport. It slides in when a module is selected and disappears when the selection is cleared. It provides a structured, navigable view of the selected module's relationships without leaving the canvas.

## Layout — Top to Bottom

```
┌──────────────────────────────────┐
│  Module Name                     │  ← large, bold, tinted with card accent color
│  uuid · 8hex                     │  ← small mono, dimmed (opacity ~0.45)
│                                  │
│  Description text here, normal   │  ← body text, full width
│  body weight, wraps if needed.   │
│                                  │
│  ─── Submodules (3) ──────────── │  ← section header with count
│  > Submodule Alpha               │  ← hover: show description tooltip
│  > Submodule Beta                │     click: navigate to parent level,
│  > Submodule Gamma               │            select & centre this submodule
│                                  │
│  ─── Link to (2) ─────────────── │  ← section header with count
│  depends-on  Target Module       │  ← relation key + module name
│  references  Another Module      │     hover: show target description
│                                  │     click: navigate, select & centre target
│                                  │
│  ─── Linked by (1) ────────────  │  ← reverse links section
│  implements  Source Module       │     hover/click same as Link to
└──────────────────────────────────┘
```

## Section: Header

- **Title**: module `name` from README.md frontmatter. Font size: `text-xl` (24px), bold. Color: the card's accent color (same color assigned to this module's primary card header). Not dimmed — full saturation.
- **UUID**: 8-char hex, mono font, `text-xs` (10px), `opacity: 0.45`. Placed directly below the title on its own line.
- **Description**: `description` from README.md, normal body weight, `text-sm` (13px), full-width. Wraps naturally. Placed below the UUID with `margin-top: 8px`.

The title color uses the same deterministic accent color assigned to the module's primary card. The color index is based on the module's position among its siblings at the current canvas level (same formula as `ModuleNode`'s `colorIndex`).

## Section: Submodules

Shown only when the module has at least one declared submodule.

Section header: "Submodules (N)" where N is the submodule count. Dim separator line above.

Each row:
- **Arrow indicator** `›` on the left, dimmed
- **Submodule name** — body text, `text-sm`
- On **hover**: a tooltip (or inline description below the name) shows the submodule's `description` text
- On **click**: navigate the canvas to the level where this submodule is visible (i.e., the selected module's level), then select and centre this submodule's card

## Section: Link to

Shown only when the module has at least one outgoing link.

Section header: "Link to (N)" where N is the outgoing link count.

Each row:
- **Relation label** — `text-xs`, muted pill or plain text (e.g., `depends-on`)
- **Target module name** — `text-sm`, primary text color. If the target UUID is not found in the project index, show the raw UUID in mono.
- **Description value** (optional) — shown only if the link entry has a `description` field; rendered as secondary text at `text-xs` below the name
- On **hover**: a tooltip or inline secondary text shows the target module's own `description` from its README.md
- On **click**: navigate the canvas to the level where the target module is visible (i.e., its parent level), then select and centre the target module's card

## Section: Linked by

Shown only when at least one other module in the project links to this module.

Section header: "Linked by (N)" where N is the count of modules that declare a link pointing to this module's UUID.

Each row has the same structure as "Link to" rows but the relation label comes from the linking module's perspective. On click: navigate to where the linking module is visible, select and centre it.

## Show / Hide Behaviour

See `selection-controller` for the full selection model. In summary:

- **Appears**: when `selectedUuid` becomes non-null (any module is selected)
- **Disappears**: when `selectedUuid` becomes null (selection cleared)
- **Transition**: slides in from the right (`transform: translateX(0)` from `translateX(100%)`), `transition: transform 200ms ease-out`. Slides out in reverse.
- The panel does not push the canvas — it overlaps from the right at a fixed `z-index`.

## Panel Width

Fixed at `320px`. On viewports narrower than `640px`, the panel may be collapsed to an icon/tab and expanded on demand (mobile consideration, not required for initial implementation).

## Navigation Behaviour on Row Click

When the user clicks a submodule row or a link row:

1. Determine the **target module** UUID.
2. Find the target module's **parent path** in the project index.
3. Navigate the canvas to the parent level (update `navStack` to end at the parent).
4. Wait for the canvas to re-render at the new level.
5. **Select** the target module (set `selectedUuid` to the target UUID).
6. **Centre** the target's card in the viewport (React Flow `fitView` with `nodes: [targetId]`, or `setCenter` to the node's position).

If the target is already visible at the current canvas level, skip steps 2–4 and go straight to select + centre.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`, `gui/design-system/foundations/spacing/resources/token-table.md`, and `gui/design-system/foundations/elevation/resources/token-table.md` for the complete token vocabulary.

The committed web copy export for this component is `web-copy.yaml`; React code must consume the generated detail-panel content artifact rather than embedding labels, section titles, or fallback strings directly in component files.
