# Primary Module Card — Modified State Spec

## What "Modified" Means

A node is in the modified state when its `README.md` has uncommitted git changes — tracked by the file-sync layer comparing working-tree content against `HEAD`. This state is orthogonal to selection: a modified node can also be selected simultaneously (combine both visual treatments, with selection border taking precedence).

## Visual Differences from Default State

```
border: 1px solid token(border-neutral)   /* same as default */
background: token(surface-default)        /* same as default */

/* Header accent bar */
header-background: token(status-modified-bg)  /* #FEF3C7 light / #451A03 dark */
header-border-bottom: 2px solid token(status-modified)  /* #F59E0B amber-500 */
```

## Anatomy

```
┌─────────────────────────────────────┐
│▓▓  module-name              [↗]  ▓▓│  ← amber header bg + bottom accent bar
├─────────────────────────────────────┤
│  Description text (unchanged)       │
└─────────────────────────────────────┘
```

Header color-dot: amber (#F59E0B) to match status.

## Modified + Selected Combined

When a node is both modified AND selected:
- Use the selection border (2px blue) — takes visual precedence over default border.
- Keep the amber header background and bottom accent bar.
- Box-shadow from selected state applies.

## Badge (optional enhancement)

An optional small "M" badge may appear in the top-right of the header (8px font, amber background pill).
This is informational only — it must not obscure the drill-in `[↗]` icon.

## Data Source

Modified state is determined by `FileSyncEngine` / `GitDiffWatcher`. The module graph emits a
`module-status-changed` event; the canvas re-renders the affected node reactively.
