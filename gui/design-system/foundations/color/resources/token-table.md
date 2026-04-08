# Color Token Reference

All tokens live in the Figma **Color** variable collection with **Light** and **Dark** modes.

## Surface tokens — `color/surface/*`

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `color/surface/canvas` | `#F5F5F5` | `#111113` | Infinite canvas background |
| `color/surface/default` | `#FFFFFF` | `#1C1C1F` | Module node card background |
| `color/surface/raised` | `#FFFFFF` | `#26262B` | Detail panel, command palette |
| `color/surface/overlay` | `#FFFFFF` | `#2E2E35` | Dropdown menus, tooltips |
| `color/surface/topbar` | `#FAFAFA` | `#17171A` | Topbar background |

## Text tokens — `color/text/*`

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `color/text/primary` | `#0F0F10` | `#F2F2F3` | Module name, panel headings |
| `color/text/secondary` | `#6B6B72` | `#9898A1` | Module description, labels |
| `color/text/tertiary` | `#A0A0A8` | `#60606A` | Breadcrumb separators, meta |
| `color/text/accent` | `#2563EB` | `#5B8DEE` | Links, selected crumb label |
| `color/text/disabled` | `#C4C4CC` | `#3A3A42` | Disabled controls |

## Border tokens — `color/border/*`

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `color/border/subtle` | `#E4E4E8` | `#2C2C33` | Default node card border |
| `color/border/default` | `#C8C8D0` | `#3A3A42` | Dividers, panel separators |
| `color/border/focus` | `#2563EB` | `#5B8DEE` | Selected node ring, focus outline |

## Edge tokens — `color/edge/*`

Stroke colors for link edges, keyed by relation type.

| Token | Value (Light) | Value (Dark) | Relation |
|-------|--------------|-------------|----------|
| `color/edge/depends-on` | `#2563EB` | `#5B8DEE` | `depends-on` |
| `color/edge/implements` | `#16A34A` | `#22C55E` | `implements` |
| `color/edge/extends` | `#9333EA` | `#A855F7` | `extends` |
| `color/edge/references` | `#9098A1` | `#60606A` | `references` |
| `color/edge/related-to` | `#9098A1` | `#60606A` | `related-to` |
| `color/edge/custom` | `#EA580C` | `#F97316` | custom relations |

## Status tokens — `color/status/*`

| Token | Value | Usage |
|-------|-------|-------|
| `color/status/clean` | `#9098A1` | Node header dot — no changes |
| `color/status/modified` | `#F59E0B` | Node header dot + accent — uncommitted changes |
| `color/status/error` | `#EF4444` | Node border + icon — parse error |
| `color/status/new` | `#2563EB` | Node border — never committed |

## Interactive tokens — `color/interactive/*`

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `color/interactive/hover` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.06)` | Hover fill overlay |
| `color/interactive/pressed` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.10)` | Press fill overlay |
| `color/interactive/selected-bg` | `#EFF6FF` | `#1E2F4D` | Selected node card tint |

## Port color palette — `color/port/*`

Eight fixed colors assigned per parent module in round-robin order to tint output port labels.

| Token | Value |
|-------|-------|
| `color/port/0` | `#5B8DEE` |
| `color/port/1` | `#22C55E` |
| `color/port/2` | `#A855F7` |
| `color/port/3` | `#F59E0B` |
| `color/port/4` | `#EF4444` |
| `color/port/5` | `#06B6D4` |
| `color/port/6` | `#F97316` |
| `color/port/7` | `#EC4899` |
