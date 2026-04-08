# Link Renderer — Port Edge Spec

## Definition

A port edge connects a submodule's port handle on the primary card to an external reference card.
This is the primary edge type for submodule-level links in the current rendering model.

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

Handle ID on primary card: `port-{sub-a-uuid}-out` (right edge of port row)
Handle on external card: default left-edge handle

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

Handle on external card: default right-edge handle
Handle ID on primary card: `port-{sub-b-uuid}-in` (left edge of port row)

## Visual Treatment

Port edges use the same stroke style table as direct edges (relation-based).

Additional distinction: port edges have a small circular "port indicator" at the port handle end:
- Circle radius: 5px
- Fill: same color as the edge stroke
- This visually anchors the edge to the specific port row.

## Bezier Curve Shape

The bezier control points must be computed relative to the port row's y-position, not the
primary card's center. This prevents edges from appearing to cut through the card body.

Recommended: set the control point departure angle to horizontal (exit/enter the card edge
at 0°) with a horizontal offset of 80px.

## Label Positioning

Same as direct-edge: centered on shaft midpoint. The label must not overlap the card bodies —
if the midpoint falls within a card bounding box, offset the label 16px above the shaft.
