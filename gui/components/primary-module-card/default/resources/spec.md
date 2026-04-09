# Primary Module Card — Default State Spec

## Card Geometry

```
width:         dimension/node-width = 240px  (fixed)
border-radius: dimension/border-radius-card = 8px
border:        1px solid color/border/subtle
background:    color/surface/default
box-shadow:    elevation/card/default
               (0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06))
```

## Internal Section Heights

| Section | Token | Value | Notes |
|---|---|---|---|
| Header row | `dimension/node-header-height` | 36px | Fixed; never collapses |
| Description body | `dimension/node-body-height` | 52px | Hidden at rest (max-height: 0); revealed on hover/select |
| Port divider | `dimension/node-divider-height` | 1px | Dashed rule |
| Per port row | `dimension/port-row-height` | 28px | Multiplied by row count |

## Header Section

```
┌──────────────────────────────────────────┐  ← 36px
│ ●  Module Name                      [↗] │
│    a1b2c3d4-...                          │
└──────────────────────────────────────────┘
```

- **Status dot (●):** 6px circle, `color/status/clean` (`#9098A1`). Positioned before the title with `spacing/1` (4px) gap.
- **Title:** `typography/node-name` (14px, 600), `color/text/primary`. Single line; truncated with ellipsis if overflow.
- **UUID:** `typography/ui-meta` (11px, 400), `color/text/tertiary`. Always visible; never hidden at rest.
- **Drill-in icon [↗]:** 16×16px SVG, `color/text/tertiary` at opacity 0.4 at rest, opacity 1.0 on hover. Aligned to header trailing edge with `spacing/4` (16px) right padding.
- **Header horizontal padding:** `spacing/4` (16px) left and right.
- **Header vertical padding:** `spacing/2` (8px) top and bottom.

## Description Section (Body)

The description section is **collapsed at rest** (`max-height: 0; overflow: hidden`) so it occupies zero height between the header and the port section. It expands on hover or selection via the title-reveal animation.

- **Font:** `typography/node-description` (13px, 400, 18px line-height)
- **Color:** `color/text/secondary`
- **Padding:** `spacing/4` (16px) horizontal, `spacing/2` (8px) vertical
- **Overflow:** text clips at bottom when expanded; no scrollbar

## Module-Level Handles

Connection handles on the description section edges. Shown conditionally:

- **Left handle (◀):** Rendered when at least one external module links TO this focused module. Handle ID = `module-{focusedUuid}-in`.
- **Right handle (▶):** Rendered when the focused module has at least one outgoing link to an external module. Handle ID = `module-{focusedUuid}-out`.
- **Hidden** when no module-level links exist in that direction.

Handle geometry: `dimension/handle-size` (8px) diameter circle. Fill: `color/surface/default`. Stroke: 1.5px `color/border/default`. Centered on the left or right edge of the description section.

## Port Section

Appears below the description section (or below the header at rest when body is collapsed), separated by a 1px dashed divider in `color/border/default`.

- Rendered only when at least one direct submodule has an external link.
- Each port row: `dimension/port-row-height` (28px) tall, `spacing/4` (16px) horizontal padding.
- Port label font: `typography/port-label` (12px, 400).
- Target port labels: `color/text/tertiary`.
- Source port labels: `color/port/{n}` (round-robin from port palette, n = index of external reference card).
- Port handle Y position (from card top): `103 + i × 28` px (see spacing token-table formula).

## External Reference Card Geometry

```
width:         min 120px, max 200px (content-sized)
border-radius: dimension/border-radius-card = 8px
border:        1px solid color/border/subtle
background:    color/surface/default
box-shadow:    none (flat)
```

- **Name:** `typography/node-name` (14px, 600), `color/text/primary`.
- **UUID:** `typography/ui-meta` (11px, 400), `color/text/tertiary`.
- **Padding:** `spacing/4` (16px) horizontal, `spacing/2` (8px) vertical.
- **Handle:** Single 8px circle on left edge (if target) or right edge (if source). Same fill/stroke as primary card handles.

## Hover Transition Details

The description reveal on hover is governed by the title-reveal animation (see `animation/title-reveal`):

1. Title shrinks from 22px → 14px (`typography/node-name`) over 220ms `ease-out`.
2. Description fades in (`opacity: 0 → 1`) over 180ms `ease-in`, starting after the title begins shrinking.
3. Card grows downward only — it never shrinks or reflows content above the header.

On hover exit:
1. Description fades out over 80ms.
2. Title expands from 14px → 22px over 220ms `ease-out`.

## Drill-in Behavior

- Clicking the [↗] icon drills into the focused module (same as double-clicking the card body).
- The icon is always present in the DOM; opacity communicates hover affordance.

## Typography Reference

| Zone | Token | Size / Weight |
|---|---|---|
| Module name | `typography/node-name` | 14px / 600 |
| UUID | `typography/ui-meta` | 11px / 400 |
| Description | `typography/node-description` | 13px / 400 |
| Port label | `typography/port-label` | 12px / 400 |
| External card name | `typography/node-name` | 14px / 600 |
| External card UUID | `typography/ui-meta` | 11px / 400 |
