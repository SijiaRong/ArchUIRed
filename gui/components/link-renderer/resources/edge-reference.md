# Link Renderer Edge Reference

## Edge Anatomy

```
  [Card A]  ──────── relation ────────►  [Card B]
            source handle          target handle
```

- **Arrow shaft** — A cubic bezier curve from the source handle to the target handle.
- **Arrowhead** — Solid filled triangle at the passive (target) end. Always points toward the module being linked TO.
- **Relation label** — The `relation` value from the link entry, rendered mid-edge as a pill. Omitted if no `relation` field is present.
- **Tooltip** — On hover, displays the `description` from the link entry. Hidden if no `description` field is present.

## Edge Categories

### 1. Direct Edge (module-level link)

Connects the primary card's module-level handle (on the description section) to an external reference card.

#### Outgoing direct edge (focused module links to external)

```
┌──────────────────────────────────┐          ┌──────────────┐
│       PRIMARY CARD               │          │  ExtCard     │
│  Module Name                     │          │  Target Name │
│  a1b2c3d4                        │          │  e5f6a7b8    │
│                                  │          └──────────────┘
│  Description text           ▶│──dep──►
│                                  │
│ ┌──────────────────────────────┐ │
│ │ (submodule ports...)         │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

Source: module source handle (▶, right edge of description section).
Target: external card's left-center anchor.
Arrow points toward the external card.

#### Incoming direct edge (external links to focused module)

```
┌──────────────┐          ┌──────────────────────────────────┐
│  ExtCard     │          │       PRIMARY CARD               │
│  Source Name │          │  Module Name                     │
│  a1b2c3d4    │          │  a1b2c3d4                        │
└──────────────┘          │                                  │
               ──dep──►│◀ Description text                │
                          │                                  │
                          │ ┌──────────────────────────────┐ │
                          │ │ (submodule ports...)         │ │
                          │ └──────────────────────────────┘ │
                          └──────────────────────────────────┘
```

Source: external card's right-center anchor.
Target: module target handle (◀, left edge of description section).
Arrow points toward the module target handle.

### 2. Port Edge (submodule-level link)

Connects a submodule's port handle (in the port section) to an external reference card.

#### Outgoing port edge (submodule links to external)

```
┌──────────────────────────────────┐          ┌──────────────┐
│       PRIMARY CARD               │          │  ExtCard     │
│  ...                             │          │  Target Name │
│ ┌──────────────────────────────┐ │          │  e5f6a7b8    │
│ │              Submodule-A  ▶│─┼──dep──►  └──────────────┘
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

Source: submodule's source port (▶, right edge of primary card at the submodule's port row).
Target: external card's left-center anchor.
Arrow points toward the external card.

#### Incoming port edge (external links to submodule)

```
┌──────────────┐          ┌──────────────────────────────────┐
│  ExtCard     │          │       PRIMARY CARD               │
│  Source Name │          │  ...                             │
│  a1b2c3d4    │          │ ┌──────────────────────────────┐ │
└──────────────┘  ──dep──►┼─│◀ Submodule-B               │ │
                          │ └──────────────────────────────┘ │
                          └──────────────────────────────────┘
```

Source: external card's right-center anchor.
Target: submodule's target port (◀, left edge of primary card at the submodule's port row).
Arrow points toward the submodule's target port.

## Same-Card Rendering Rule

When both endpoints of a link resolve to handles on the same card, the link is **not drawn** at this canvas level. The link data is fully valid — this is a rendering-only decision.

```
┌──────────────────────────────────┐
│       PRIMARY CARD               │
│  Module ◀ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▶ │  ✗ not drawn (module → own submodule)
│ ┌──────────────────────────────┐ │
│ │ ◀ Sub-A ─ ─ ─ ─ ─ Sub-B ▶│ │  ✗ not drawn (sibling → sibling)
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

Both are valid in the data model but are not drawn at this level. They become visible as cross-card edges after drilling into the appropriate module.

## Edge Styling Reference Table

| Relation | Stroke weight | Dash pattern | Color token | Arrowhead style | Label font style |
|----------|--------------|--------------|-------------|-----------------|-----------------|
| `depends-on` | 2px | Solid | `color/edge/depends-on` | Solid filled triangle | 11px, `text/tertiary`, normal |
| `implements` | 1.5px | Solid | `color/edge/implements` | Solid filled triangle | 11px, `text/tertiary`, normal |
| `extends` | 1.5px | 6px dash, 3px gap | `color/edge/extends` | Solid filled triangle | 11px, `text/tertiary`, italic |
| `references` | 1px | 2px dash, 4px gap | `color/edge/references` | Solid filled triangle | 11px, `text/tertiary`, normal |
| `related-to` | 1px | 2px dash, 4px gap | `color/edge/related-to` | Solid filled triangle | 11px, `text/tertiary`, normal |
| custom string | 1.5px | Solid | `color/edge/custom` | Solid filled triangle | 11px, `text/tertiary`, normal |
| (none / absent) | 1px | Solid | `color/edge/default` | Solid filled triangle | — (no label) |

### Arrowhead Dimensions

All arrowhead variants use the same geometry:
- Shape: solid filled equilateral-ish triangle
- Base: 10px (perpendicular to edge direction)
- Height: 8px (along edge direction)
- Fill: same as the edge's color token

### Bezier Control Points

| Edge type | Horizontal offset `H` |
|-----------|----------------------|
| Direct edge | `max(60, dist × 0.4)` px |
| Port edge | `max(80, dist × 0.4)` px |

Port edges use a larger offset to ensure the shaft clears the primary card body.

## Port Indicator Circle (Port Edges Only)

A small circle is drawn at the port handle end of every port edge:
- Radius: 5px
- Fill: same color token as the edge stroke

## Interaction States

| State | Visual change |
|-------|--------------|
| Default | Stroke at full opacity per color token |
| Hover | Edge z-order raises; tooltip shown if `description` present |
| Selected | Stroke color shifts to `color/accent/primary`; delete affordance (×) at midpoint |
| Dragging card | Connected edges follow the card; bezier recomputed in real time |

## Data Flow

```
focused module .archui/index.yaml
    └── links[]  → direct edges (module-level handles)

submodule .archui/index.yaml
    └── links[]  → port edges (submodule port handles)

each link entry:
    ├── uuid        → resolve to external reference card
    ├── relation    → stroke style, dash pattern, color token, and label
    └── description → hover tooltip
```
