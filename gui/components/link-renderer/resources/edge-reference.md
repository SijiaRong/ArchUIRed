# Link Renderer Edge Reference

## Edge Anatomy

```
  [Card A]  ──────── relation ────────►  [Card B]
            source handle          target handle
```

- **Arrow shaft** — A bezier curve from the source handle to the target handle.
- **Arrowhead** — Directional indicator at the passive (target) end. Always points toward the module being linked TO.
- **Relation label** — The `relation` value from the link entry, rendered mid-edge. Omitted if no relation is specified.
- **Tooltip** — On hover, displays the `description` from the link entry.

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
Target: external card's handle (left edge).
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

Source: external card's handle (right edge).
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

Source: submodule's source port (▶, right edge of primary card, port section).
Target: external card's handle (left edge).
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

Source: external card's handle (right edge).
Target: submodule's target port (◀, left edge of primary card, port section).
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

Both examples above are valid links in the data model but are not drawn at this level. They become visible as cross-card edges after drilling in.

## Relation Type Styling

| Relation | Stroke style | Color |
|----------|-------------|-------|
| `depends-on` | Solid, thick | Blue |
| `implements` | Solid | Green |
| `extends` | Dashed | Purple |
| `references` | Dotted | Gray |
| `related-to` | Dotted, thin | Gray |
| Custom | Solid | Orange |

## Data Flow

```
focused module README.md frontmatter
    └── links[]  → direct edges (module-level handles)

submodule README.md frontmatter
    └── links[]  → port edges (submodule port handles)

each link entry:
    ├── uuid        → resolve to external reference card
    ├── relation    → stroke style and label
    └── description → hover tooltip
```
