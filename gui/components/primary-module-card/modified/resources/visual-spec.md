# Primary Module Card Modified — Visual Specification

## Primary Card — Modified

```
┌─────────────────────────────────────────────────┐
│ ●  Module Name                             [↗]  │  ← status dot: amber (color/status/modified)
│    a1b2c3d4-e5f6-...                            │  ← header bg: status/modified-tinted surface
├══════════════════════════════════════════════════╡  ← header bottom accent: 2px amber bar
│   One-sentence description text.                │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│◀ Submodule-A                   Submodule-B   ▶│
└─────────────────────────────────────────────────┘
```

### Visual Token Table — Primary Card (Modified)

| Property | Default value | Modified override | Token |
|---|---|---|---|
| Border | 1px `color/border/subtle` | **unchanged** | `color/border/subtle` |
| Background | `color/surface/default` | **unchanged** | `color/surface/default` |
| Header background | `color/surface/default` | **amber-tinted** | light: `#FEF3C7` dark: `#451A03` |
| Header bottom accent bar | none | **2px solid** `color/status/modified` | `#F59E0B` |
| Status dot color | `color/status/clean` | **`color/status/modified`** | `#F59E0B` |
| Shadow | `elevation/card/default` | **unchanged** | — |
| Title color | `color/text/primary` | **unchanged** | — |
| Description | unchanged | **unchanged** | — |

### Optional "M" Badge

An optional 8px amber pill badge labeled **M** may appear in the top-right of the header, inset from the [↗] drill-in icon:
- Font: `typography/ui-meta` (11px), white text
- Background: `color/status/modified` (`#F59E0B`)
- Border-radius: `dimension/border-radius-small` (4px)
- Must not overlap the [↗] icon — placed to its left with `spacing/1` (4px) gap

## When Applied

Applied whenever the module's tracked files contain uncommitted changes according to `git status`. The GUI polls git status on a short interval (or on filesystem watch events) to keep this state current.

## Modified + Selected Combined

When a card is both modified and selected simultaneously:
- **Border:** 2px solid `color/border/focus` (selection takes precedence)
- **Background:** `color/interactive/selected-bg` (selection tint applied)
- **Header:** amber background + 2px amber bottom bar remain visible
- **Status dot:** remains `color/status/modified` (amber)
- **Shadow:** `elevation/card/selected` (focus ring applied)

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Modified`
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
