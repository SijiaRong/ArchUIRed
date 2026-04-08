# Primary Module Card — Selected State Spec

## Visual Differences from Default State

### Primary Card — Selected

```
border: 2px solid token(accent-primary)    /* #3B82F6 blue-500 */
box-shadow: 0 0 0 3px rgba(59,130,246,0.20), 0 4px 12px rgba(0,0,0,0.12)
background: token(surface-selected)        /* #EFF6FF light / #1E3A5F dark */
```

### External Reference Card — Selected

```
border: 2px solid token(accent-primary)    /* #3B82F6 blue-500 */
box-shadow: 0 0 0 3px rgba(59,130,246,0.20)
background: token(surface-selected)
```

All other dimensions and typography are identical to the default state for each card type.

## Anatomy — Primary Card

```
┌═════════════════════════════════════════════════┐  ← 2px blue border
│  Module Name                                    │  header: unchanged
│  a1b2c3d4                                       │
├─────────────────────────────────────────────────┤
│◀ Description text                          ▶│  module-level handles always visible
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│ ◀ Sub-A                        Sub-B ▶│  port handles always visible
└═════════════════════════════════════════════════┘
```

## Anatomy — External Reference Card

```
┌═══════════════════════┐  ← 2px blue border
│  Module Name          │
│  e5f6a7b8             │
└═══════════════════════┘
  ○ handle (always visible)
```

In the selected state, connection handles are always visible (not hover-gated).

## Detail Panel Side Effect

When a card enters selected state, the detail panel slides in from the right edge of the viewport:
- Animation: translateX(100%) → translateX(0), 180ms ease-out
- Panel width: 320px on desktop, full-width drawer on mobile (<768px)

## Interaction Notes

- Single-clicking a DIFFERENT card while one is selected: new card enters selected state,
  old card returns to default (or modified/error if applicable). No idle transition needed.
- Pressing Escape or clicking empty canvas: returns to idle (card returns to default state).
- The selected state is mutually exclusive: at most one card is selected at a time.
