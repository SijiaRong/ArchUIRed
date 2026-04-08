# Primary Module Card — Default State Spec

## Primary Card Dimensions

```
min-width:  360px
max-width:  520px
min-height: 120px  (header + description, no port section)
border-radius: 12px
border: 1px solid token(border-neutral)   /* #D1D5DB light / #374151 dark */
background: token(surface-default)        /* #FFFFFF light / #1F2937 dark */
box-shadow: 0 2px 8px rgba(0,0,0,0.12)   /* elevated shadow for focal element */
```

## External Reference Card Dimensions

```
min-width:  140px
max-width:  220px
min-height: 48px
border-radius: 8px
border: 1px solid token(border-subtle)
background: token(surface-default)
box-shadow: none                          /* flat, no elevation */
```

## Primary Card Internal Layout

```
┌─────────────────────────────────────────────────┐  ← outer card (12px radius)
│  Module Name                                    │  title: 16px medium, token(text-primary)
│  a1b2c3d4                                       │  uuid: 11px mono, token(text-tertiary)
├─────────────────────────────────────────────────┤  divider: 1px solid token(border-neutral)
│                                                 │
│◀ One-sentence description text             ▶│  body: 13px regular, token(text-secondary)
│  wrapping at max-width.                         │  module-level handles on left/right edges
│                                                 │  (shown only when module-level links exist)
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  port divider: 1px dashed
│◀ Sub-A                          Sub-B (out) ▶│  port rows: 11px, token(text-tertiary)
└─────────────────────────────────────────────────┘
```

Module-level handles: 8px circle, centered on left/right edge of description section.
Handle fill: token(surface-default). Handle stroke: token(border-neutral) 1.5px.
Handles appear only when module-level links exist in that direction.

Port handles: 8px circle, centered on left/right edge of port rows.
Same styling as module-level handles.

## External Reference Card Internal Layout

```
┌────────────────────┐  ← outer card (8px radius)
│  Module Name       │  name: 13px medium, token(text-primary)
│  e5f6a7b8          │  uuid: 10px mono, token(text-tertiary), more dimmed
└────────────────────┘
  ○ handle (8px)
```

Handle: 8px circle on left or right edge, depending on link direction.

## Typography

| Zone                       | Font size | Weight | Color                     |
|----------------------------|-----------|--------|---------------------------|
| Primary card title         | 16px      | 500    | token(text-primary)       |
| Primary card UUID          | 11px      | 400    | token(text-tertiary)      |
| Primary card description   | 13px      | 400    | token(text-secondary)     |
| Port labels                | 11px      | 400    | token(text-tertiary)      |
| External card name         | 13px      | 500    | token(text-primary)       |
| External card UUID         | 10px      | 400    | token(text-tertiary)      |

## Drill-in Icon [↗]

16x16px in primary card header area. Visible at rest (opacity 0.4), full opacity on hover.
Clicking triggers drill-in (same as double-click on card body).
Not present on external reference cards (double-click navigates instead).
