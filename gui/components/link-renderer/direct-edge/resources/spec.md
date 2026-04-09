# Link Renderer — Direct Edge Spec

## Definition

A direct edge connects the primary card's module-level handle (on the description section) to an external reference card. It represents a link owned by the focused module itself (in the focused module's own `links` array).

## Visual Anatomy

```
  PRIMARY CARD                                    [External Card]
  ┌────────────────────────┐
  │  Description      ▶│── depends-on ──────────►
  └────────────────────────┘
```

- **Shaft**: cubic bezier curve. Control point horizontal offset = 60px from each handle.
- **Arrowhead**: filled triangle, 10px base × 8px height, at the target (passive) end. Always points toward the module being linked TO.
- **Relation label**: centered on the shaft midpoint. Font 11px, `text/tertiary` color, pill background (4px padding, 4px corner radius). Hidden if `relation` is absent on the link entry.
- **Hover tooltip**: full `description` value from the link entry. Max 240px wide, 4px corner radius, `surface/overlay` background, `text/primary` color. Hidden if `description` is absent.

## Handle Positions

| Handle | Location | Rendered when |
|--------|----------|---------------|
| Source (▶) | Vertical center of the description section, right edge of the primary card | Focused module has ≥ 1 outgoing direct link to an external module |
| Target (◀) | Vertical center of the description section, left edge of the primary card | ≥ 1 external module links to the focused module |

Both handles are rendered only when the corresponding direct edge exists. No direct links in that direction = the handle is hidden entirely.

## Arrowhead Shape and Size

- Shape: solid filled equilateral-ish triangle
- Base: 10px (perpendicular to edge direction)
- Height: 8px (along edge direction)
- Fill: same color as the edge stroke
- Placement: flush at the target handle — the tip of the arrowhead touches the handle position

## Relation Label Placement

The label is rendered at the geometric midpoint of the bezier curve:

- Compute `t = 0.5` on the cubic bezier to obtain the midpoint coordinates.
- Place a pill element (text + background) centered on that point.
- If the midpoint falls inside any card's bounding box, offset the label 16px above the midpoint.
- Label is omitted entirely if the link entry has no `relation` field.

## Hover Tooltip for Description

- Trigger: pointer enters the 12px-wide hit target of the edge shaft.
- Content: the `description` field from the link entry. If absent, no tooltip is shown.
- Layout: single- or multi-line text, max 240px wide; wraps at word boundaries.
- Tokens: `surface/overlay` background, `text/primary` foreground, `elevation/overlay` shadow, 4px corner radius.
- Dismissal: pointer leaves the hit target.

## Same-Card Rule Application

When both the source handle and the target handle of a direct link resolve to positions on the same primary card (i.e., the focused module links to one of its own submodules), the direct edge is **not drawn**. The link data remains valid. Such links become visible when the user drills into the appropriate module.

## Stroke Styles by Relation Type

| Relation | Weight | Dash pattern | Color token |
|----------|--------|--------------|-------------|
| `depends-on` | 2px | Solid | `color/edge/depends-on` |
| `implements` | 1.5px | Solid | `color/edge/implements` |
| `extends` | 1.5px | 6px dash, 3px gap | `color/edge/extends` |
| `references` | 1px | 2px dash, 4px gap | `color/edge/references` |
| `related-to` | 1px | 2px dash, 4px gap | `color/edge/related-to` |
| custom string | 1.5px | Solid | `color/edge/custom` |
| (none / absent) | 1px | Solid | `color/edge/default` |

## Z-Order and Interaction

- Edges render below cards (z-order: below all card layers).
- On hover, the hovered edge raises above all non-hovered edges.
- **Hit target**: 12px wide — wider than the visual stroke — to make edges easy to interact with.

## Selection State

Clicking an edge selects it:

- Stroke color shifts to `color/accent/primary` regardless of relation type.
- A delete affordance (×) appears centered at the label midpoint position.
- Clicking × removes the corresponding link entry from the focused module's `.archui/index.yaml` (via file-sync).
- Clicking elsewhere on the canvas deselects.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Edge stroke colors are defined under `color/edge/*` in `gui/design-system/foundations/color/resources/token-table.md`. Consult the full token vocabulary in `gui/design-system/foundations/` for all other visual properties.
