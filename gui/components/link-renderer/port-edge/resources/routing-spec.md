# Port Edge Routing Specification

## Overview

Port edges connect submodule port handles on the primary card to external reference cards. Because these handles sit at the left or right edge of the primary card at a specific row's vertical center, the routing algorithm must ensure the bezier curve departs and arrives horizontally and does not visually intersect any card body.

## Handle Coordinates

### Outgoing (source on primary card)

```
Source handle: port-{subUuid}-out
  x = primary_card.right
  y = port_row[subUuid].top + port_row[subUuid].height / 2

Target handle: external_card.left_center
  x = external_card.left
  y = external_card.top + external_card.height / 2
```

### Incoming (target on primary card)

```
Source handle: external_card.right_center
  x = external_card.right
  y = external_card.top + external_card.height / 2

Target handle: port-{subUuid}-in
  x = primary_card.left
  y = port_row[subUuid].top + port_row[subUuid].height / 2
```

## Bezier Control Points

Port edges use cubic bezier curves with horizontally-oriented control points. The departure and arrival angles are always 0° (horizontal), which prevents the edge from appearing to cut through a card body.

### Outgoing edge control points

```
P0 = source handle  (x₀, y₀)
P1 = (x₀ + H, y₀)          -- depart horizontally from primary card
P2 = (x₃ - H, y₃)          -- arrive horizontally at external card
P3 = target handle  (x₃, y₃)
```

Where `H = max(80, |x₃ - x₀| * 0.4)`.

The `max(80, ...)` term ensures a minimum curve tension even when the external card is very close to the primary card.

### Incoming edge control points

```
P0 = source handle  (x₀, y₀)  -- external card right-center
P1 = (x₀ + H, y₀)
P2 = (x₃ - H, y₃)
P3 = target handle  (x₃, y₃)  -- primary card left port handle
```

Same formula for `H`.

## Minimum Edge Length

If the straight-line distance between source and target is less than **120px**, the control point offset is increased to force a visible curve:

```
H = max(80, distance * 0.6)
```

This prevents the edge from appearing as an ambiguous near-straight line when cards are close together.

## Collision Avoidance

Port edges do not perform hard collision avoidance against other cards on the canvas. The horizontal departure/arrival convention (0° exit angle) combined with the control point formula is sufficient to keep the shaft outside the primary card body in the common case.

### Same-card suppression

If both handles of a port edge resolve to positions on the same primary card — because both the source submodule and the target submodule belong to the focused module — the edge is **not drawn** at this level. This is the same-card rendering rule (defined in `link-renderer/SPEC.md`).

### Label overlap avoidance

The relation label is placed at the bezier midpoint (`t = 0.5`). If that point lies inside any card's bounding box, the label is shifted 16px above the midpoint along the canvas y-axis.

## Fan Offset for Parallel Edges

When two or more port edges share the same source/target pair (e.g., a submodule has two links to the same external module), the edges are rendered as a fan:

- Each parallel edge receives an angular offset from the baseline direction.
- Offset step: ±6° per additional edge.
- Example: 3 parallel edges → angles are -6°, 0°, +6° from the baseline.
- The relation label for each fanned edge is placed at its own bezier midpoint.

## Summary of Key Constants

| Parameter | Value | Notes |
|-----------|-------|-------|
| Base control point offset (`H`) | `max(80, dist × 0.4)` px | Ensures visible curve |
| Minimum distance threshold | 120px | Below this, use `dist × 0.6` |
| Fan offset step | ±6° per parallel edge | Angular spread |
| Port indicator circle radius | 5px | At port handle end |
| Hit target width | 12px | For hover and click |

## Design System

Routing geometry is purely positional. All color, stroke, and typography values must use tokens from `gui/design-system/foundations/`. Do not hardcode raw pixel values for visual properties — the constants in this document describe layout geometry only.
