# Primary Module Card — Modified State Spec

## What "Modified" Means

A node is in the modified state when the module's tracked files (e.g. `README.md`, `SPEC.md`, `.archui/index.yaml`) contain uncommitted changes according to `git status`. This state is determined by the `FileSyncEngine` / `GitDiffWatcher` layer. The module graph emits a `module-status-changed` event; the canvas re-renders the affected node reactively.

Modified state is **orthogonal** to selection: a modified node can also be selected simultaneously.

## Visual Differences from Default State

### Header

```
header-background:    (light) #FEF3C7   (dark) #451A03
                      (amber-50 / amber-950 approximate)
header-border-bottom: 2px solid color/status/modified   (#F59E0B)
status-dot:           color/status/modified             (#F59E0B)
```

### Card Outer Shell

```
border:        1px solid color/border/subtle  /* UNCHANGED from default */
background:    color/surface/default          /* UNCHANGED from default */
box-shadow:    elevation/card/default         /* UNCHANGED from default */
```

## Anatomy

```
┌──────────────────────────────────────────────────┐
│ ●  Module Name                              [↗] │  ← amber header bg, amber dot
│    a1b2c3d4-...                                 │
╞══════════════════════════════════════════════════╡  ← 2px amber bottom accent bar
│  Description text (unchanged styling)            │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ┤
│◀ Sub-A                          Sub-B (out)   ▶│
└──────────────────────────────────────────────────┘
```

## Data Source

`FileSyncEngine` watches the working tree via `chokidar` (or platform equivalent). On file change:
1. Re-run `git status --porcelain` for the affected module folder.
2. If any tracked file shows `M`, `A`, `D`, or `R` prefix → emit `module-status-changed` with `status: "modified"`.
3. If no tracked file changes → emit `status: "clean"`.

The canvas subscribes to `module-status-changed` events and updates the affected node without re-rendering the full canvas.

## Optional M Badge

An optional small pill badge may appear inside the header, to the left of the [↗] drill-in icon:

```
text:           "M"
font:           typography/ui-meta (11px, 400)
text-color:     #FFFFFF
background:     color/status/modified (#F59E0B)
border-radius:  dimension/border-radius-small (4px)
padding:        2px 4px
margin-right:   spacing/1 (4px) from [↗] icon
```

This badge is informational only. Implementation is optional; the header accent bar and status dot are the primary indicators.

## Combined State: Modified + Selected

| Property | Value |
|---|---|
| Border | 2px solid `color/border/focus` (selection wins) |
| Background | `color/interactive/selected-bg` (selection tint) |
| Header background | Amber-tinted (retained) |
| Header bottom accent | 2px `color/status/modified` (retained) |
| Status dot | `color/status/modified` amber (retained) |
| Box-shadow | `elevation/card/selected` (focus ring added) |

## Transition Behavior

No animation is defined for entering or leaving the modified state. The header background and bottom bar appear/disappear immediately on `module-status-changed`. If a smooth transition is desired, a 100ms `ease-in-out` cross-fade on the `background-color` and `border-color` is acceptable, but not required.
