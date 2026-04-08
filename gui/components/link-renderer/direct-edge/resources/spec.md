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

- **Shaft**: cubic bezier curve. Control point offset = 60px from each handle horizontally.
- **Arrowhead**: filled triangle, 10px base × 8px height, at the target end. Always points toward the passive (target) side.
- **Relation label**: centered on the shaft midpoint. Font 11px, token(text-tertiary) background
  pill (4px padding, 4px radius). Hidden if `relation` is absent on the link entry.
- **Hover tooltip**: full `description` from the link entry. Max 240px wide, 4px radius.

## Stroke Styles by Relation

| Relation      | Stroke style        | Color                        |
|---------------|---------------------|------------------------------|
| `depends-on`  | Solid, 2px          | #3B82F6 (blue-500)           |
| `implements`  | Solid, 1.5px        | #10B981 (emerald-500)        |
| `extends`     | Dashed 6,3, 1.5px   | #8B5CF6 (violet-500)         |
| `references`  | Dotted 2,4, 1px     | #9CA3AF (gray-400)           |
| `related-to`  | Dotted 2,4, 1px     | #9CA3AF (gray-400)           |
| custom        | Solid, 1.5px        | #F97316 (orange-500)         |
| (none)        | Solid, 1px          | #D1D5DB (gray-300)           |

## Handle Visibility

The module-level handle (▶ or ◀) on the description section is only rendered when at least one direct edge exists in that direction. No links = no handle.

## Z-Order

Edges render below cards. When hovered, the edge z-order raises above non-hovered edges.

## Hit Target

The clickable/hoverable hit target for the edge is 12px wide (wider than the visual stroke)
to make edges easier to interact with.

## Selection State

Clicking an edge selects it:
- Stroke color shifts to token(accent-primary) regardless of relation type.
- A delete affordance (×) appears at the midpoint.
- Clicking × removes the link entry from the focused module's frontmatter (via file-sync).
