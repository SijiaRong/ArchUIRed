# Link Renderer — Port Edge Spec

## Definition

A port edge connects a submodule's port handle on the primary card to an external reference card. This is the primary edge type for submodule-level links in the current rendering model.

## Two Variants

### Outgoing Port Edge

A submodule of the focused module links to an external module. The edge exits through the primary card's port section.

```
PRIMARY CARD                                [External Card]
┌──────────────────────────────────┐
│ ┌──────────────────────────────┐ │
│ │              Submodule-A  ▶│─┼── depends-on ──────────►
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

- Handle ID on primary card: `port-{sub-a-uuid}-out` (right edge of the submodule's port row)
- Handle on external card: default left-edge handle (vertical center of the external reference card)

### Incoming Port Edge

An external module links to a submodule of the focused module. The edge arrives at the primary card's port section.

```
[External Card]                     PRIMARY CARD
                                    ┌──────────────────────────────────┐
                                    │ ┌──────────────────────────────┐ │
               ── depends-on ──►┼─│◀ Submodule-B               │ │
                                    │ └──────────────────────────────┘ │
                                    └──────────────────────────────────┘
```

- Handle on external card: default right-edge handle (vertical center of the external reference card)
- Handle ID on primary card: `port-{sub-b-uuid}-in` (left edge of the submodule's port row)

## Port Handle Positions

Port handles are horizontally anchored to the left or right edge of the primary card and vertically aligned to the **vertical center of each submodule's port row** in the port section. Each submodule row has a fixed height (see `gui/design-system/foundations/spacing/resources/token-table.md`); the handle sits at `row-top + row-height / 2`.

- Source handle (▶): right edge of the primary card, at the submodule's row vertical center.
- Target handle (◀): left edge of the primary card, at the submodule's row vertical center.

Handles are always present for submodule port rows (unlike module-level handles, which are conditionally shown). If a submodule has no outgoing links the source handle is still rendered but visually subdued (`color/handle/inactive`).

## Port Indicator Circle

A small circle is drawn at the port handle end of each port edge to visually anchor it to the specific port row:

- Radius: 5px
- Fill: same color as the edge stroke (by relation type, see `edge-reference.md`)
- Placement: centered on the handle position, drawn on top of the edge shaft

## Visual Treatment

Port edges use the same stroke style, arrowhead shape/size, relation label, and hover tooltip as direct edges. Full styling reference is in `resources/edge-reference.md`.

## Bezier Curve Shape

Control points are computed relative to the port row's **y-position** (not the primary card center). This prevents the edge shaft from appearing to cut through the card body.

- Exit/entry angle: horizontal (0°) at both handles.
- Control point horizontal offset: 80px from each handle.
- Example: for a source handle at `(x₀, y₀)`, the first control point is at `(x₀ + 80, y₀)`.

## Relation Label Placement

- Label centered at `t = 0.5` on the cubic bezier curve.
- If the midpoint falls inside any card's bounding box, offset the label 16px above the shaft midpoint.
- Label omitted if the link entry has no `relation` field.

## Hover Tooltip

Same behavior as direct edges: shows `description` from the link entry on pointer hover over the 12px hit target. Hidden if `description` is absent.

## Z-Order and Interaction

- Port edges render below cards and above the canvas background.
- On hover, the hovered edge z-order raises above all non-hovered edges.
- Hit target: 12px wide.

## Selection State

Same as direct edges: clicking selects the edge, shifts stroke to `color/accent/primary`, and shows a delete affordance (×) at the label midpoint. Clicking × removes the link entry from the submodule's `.archui/index.yaml` (via file-sync).

## Design System

All visual properties must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values. Edge stroke colors are defined under `color/edge/*` in `gui/design-system/foundations/color/resources/token-table.md`.
