# Primary Module Card — Port Section Spec

## When the Port Section Appears

The port section is appended below the description body when **at least one direct submodule of the focused module has an external link**. An external link is a link where one endpoint resolves to a module outside the primary card hierarchy (not the focused module itself and not a sibling submodule).

The port section is **not rendered** in the error state (submodule links cannot be resolved).

## Port Row Visibility Rules

A port row is generated for submodule S when:

**Source port (▶):** S has a `links` entry in its `.archui/index.yaml` whose target UUID resolves to a module outside the primary card (i.e., the target is an external reference card on this canvas level).

**Target port (◀):** A module outside the primary card has a `links` entry targeting S's UUID.

A submodule may have both a source and a target port row if it has both incoming and outgoing external links.

Submodule-to-sibling links (where both endpoints are inside the same primary card) are **not shown** in the port section — this is a rendering-only exclusion rule. The link data is valid and will appear as an edge when the user drills into the parent module.

## Port Row Dimensions

```
row-height:    dimension/port-row-height = 28px
padding-left:  spacing/4 = 16px
padding-right: spacing/4 = 16px
```

## Handle Positioning

For port row `i` (0-indexed from the top of the port section), the handle Y coordinate from the **top of the card** is:

```
handle_y = dimension/node-header-height
          + dimension/node-body-height
          + dimension/node-divider-height
          + i × dimension/port-row-height
          + dimension/port-row-height / 2
         = 36 + 52 + 1 + i × 28 + 14
         = 103 + i × 28   (px)
```

This formula must be reproduced identically on all canvas platforms to align link edge endpoints with handle positions.

Handle geometry:
- Diameter: `dimension/handle-size` = 8px
- Fill: `color/surface/default`
- Stroke: 1.5px `color/border/default`
- Target handle ID: `port-{submoduleUuid}-in`
- Source handle ID: `port-{submoduleUuid}-out`

## Source Port Color Assignment

Source port labels are color-coded by the external reference card they link to. Colors are assigned from the `color/port/*` palette in round-robin order (index 0–7, wrapping at 8), where the index is the position of the external reference card in the canvas render order (determined by initial layout placement, stable across renders).

Target port labels always use `color/text/tertiary` — no color assignment.

## Drill-in Interaction

Double-clicking a port row drills into that submodule:
1. The canvas re-renders with the submodule as the new primary card.
2. The breadcrumb updates to reflect the new path.
3. The previous primary card's position is saved to `.archui/layout.yaml` for back-navigation.

Single-clicking a port row selects the **submodule** as a secondary selection (highlights the row) but does not navigate.

## Overflow Collapse

When the port section has more than 6 rows:
- Show the first 5 rows.
- A `+N more ▾` indicator row occupies the 6th row slot.
- N = total rows − 5.
- Clicking the indicator expands to show all rows (no animation required).
- Expanded state is not persisted; collapsing the card (moving away from hover/selection) resets to collapsed.

## Port Section with Command Bar

When a command bar is also present, the port section appears **above** the command bar:

```
┌─────────────────────────────────────────┐
│  Header                                 │
├─────────────────────────────────────────┤
│  Description body                       │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  ← port divider
│  Port rows                              │
├─────────────────────────────────────────┤  ← command bar divider
│  [Command buttons]                      │
└─────────────────────────────────────────┘
```

## Empty State

If no direct submodule has an external link, the entire port section is absent — no divider, no placeholder rows, no empty space. The card ends after the description body (or after the command bar if present).
