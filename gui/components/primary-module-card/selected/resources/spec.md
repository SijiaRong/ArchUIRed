# Primary Module Card — Selected State Spec

## What Triggers the Selected State

A card enters the selected state when the user single-clicks it on the canvas. At most one card is selected at a time — selecting a new card deselects the previous one.

## Visual Differences from Default State

### Primary Card — Selected

```
border:        2px solid color/border/focus
               (light: #2563EB  dark: #5B8DEE)
background:    color/interactive/selected-bg
               (light: #EFF6FF  dark: #1E2F4D)
box-shadow:    elevation/card/selected
               focus ring: 0 0 0 3px rgba(37,99,235,0.20)
               drop shadow: 0 1px 3px rgba(0,0,0,0.08)
               (dark mode ring: rgba(91,141,238,0.25))
```

### External Reference Card — Selected

```
border:        2px solid color/border/focus
background:    color/interactive/selected-bg
box-shadow:    0 0 0 3px rgba(37,99,235,0.20)
               (no additional drop shadow — external cards are flat)
```

## Anatomy — Primary Card

```
╔══════════════════════════════════════════════════╗  ← 2px blue border
║  ●  Module Name                             [↗] ║  ← drill-in always visible
║     a1b2c3d4-...                                ║
╠══════════════════════════════════════════════════╣
║◀  Description text (always expanded in          ▶║  ← handles always visible
║   selected state).                               ║
╠ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ╣
║◀ Sub-A                           Sub-B (out)  ▶║  ← handles always visible
╚══════════════════════════════════════════════════╝
```

## Persistent Visibilities in Selected State

| Element | Default state | Selected state |
|---|---|---|
| Description body | Collapsed at rest, expanded on hover | **Always expanded** |
| Module-level handles (◀/▶) | Hover-gated | **Always visible** |
| Port row handles (◀/▶) | Hover-gated | **Always visible** |
| Drill-in icon [↗] | Opacity 0.4 at rest, 1.0 on hover | **Always opacity 1.0** |

The description expanding on selection follows the same title-reveal animation as hover (220ms font-size, 180ms opacity). If already expanded from hover, no re-animation occurs.

## Anatomy — External Reference Card

```
╔═════════════════════════╗  ← 2px blue border
║  Module Name            ║
║  e5f6a7b8               ║
╚═════════════════════════╝
○  ← handle always visible
```

## Detail Panel Integration

Selection triggers the detail panel to open:

```
animation:  translateX(100%) → translateX(0)
duration:   180ms
easing:     ease-out
```

- Desktop: `dimension/detail-panel-width` = 320px wide, anchored to viewport right edge.
- Mobile (< 768px): full-width bottom drawer, 60vh height.
- Deselection (Escape or click on empty canvas): panel closes with reverse animation (translateX(0) → translateX(100%), 150ms `ease-in`).

## Deselection

| Trigger | Behavior |
|---|---|
| Click a different card | New card selected; old card returns to its prior state |
| Press Escape | Active card returns to default (or modified/error); detail panel closes |
| Click empty canvas | Same as Escape |

## Combined State: Selected + Modified

When a node is simultaneously selected and modified:
- Apply the selected border (2px `color/border/focus`) — takes precedence over default border.
- Keep the amber header background (`color/status/modified`-tinted surface) and status dot.
- Apply `elevation/card/selected` box-shadow.
- Description section remains expanded.

## Combined State: Selected + Error

When a node is simultaneously selected and in error:
- Apply the selected border (2px `color/border/focus`) — takes precedence over error border.
- Keep the red error icon and error message text in the body.
- Apply `elevation/card/selected` box-shadow.
