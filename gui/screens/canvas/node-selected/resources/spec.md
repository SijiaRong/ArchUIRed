# Canvas Screen — Node Selected State Spec

## Layout Measurements

```
┌─────────────────────────────────────────┬──────────────────┐
│  Topbar (48px)                          │                  │
│  Breadcrumb (32px)                      │  Detail Panel    │
├─────────────────────────────────────────┤  width: 320px    │
│                                         │                  │
│  Canvas Area                            │  (slides in      │
│  width: 100vw − 320px                   │   from right)    │
│  height: 100vh − 80px                   │                  │
│                                         │                  │
└─────────────────────────────────────────┴──────────────────┘
```

Canvas area shrinks by 320px on the right when the detail panel opens.
On mobile (<768px): detail panel is a bottom sheet (50vh tall) instead of a side panel.

## Detail Panel Content

See `gui/components/detail-panel` for the authoritative layout spec. Summary:

```
┌──────────────────────────────────────┐
│  Module Name (large, accent-tinted)  │  ← title: 24px bold, module accent color
│  6f1c4a9d                            │  ← uuid: 11px mono, opacity 0.45
│                                      │
│  Description text here, full width.  │  ← 13px regular, text/secondary
│                                      │
│  ─── Submodules (N) ──────────────── │  ← shown only when N > 0
│  › Submodule Alpha                   │
│  › Submodule Beta                    │
│                                      │
│  ─── Link to (N) ────────────────── │  ← shown only when N > 0
│  depends-on  Target Module           │
│                                      │
│  ─── Linked by (N) ───────────────── │  ← shown only when N > 0
│  implements  Source Module           │
└──────────────────────────────────────┘
```

Clicking any row navigates to the target module's canvas level and selects it. Panel dismisses when `selectedUuid` becomes null (empty canvas click or navigation without target).

## Detail Panel Dimensions

```
width: 320px
padding: 16px
background: token(surface-panel)     /* #F9FAFB light / #1F2937 dark */
border-left: 1px solid token(border-subtle)
font-size: 13px
```

## Panel Animation

Open (entering node-selected):
- translateX(320px) → translateX(0), 180ms ease-out
- Canvas area simultaneously narrows: width transition 180ms ease-out

Close (returning to idle):
- translateX(0) → translateX(320px), 120ms ease-in
- Canvas area widens simultaneously

## Selected Card Visual Changes

See `primary-module-card/selected` spec for the card highlight treatment (applies to both primary and external cards).
The selected card does NOT move — it stays at its current canvas position.
The canvas may pan slightly to keep the selected card visible after the panel opens.

## Interactions

- Click `[×]` on panel → idle (deselects)
- Press Escape → idle
- Click empty canvas → idle
- Click different card → node-selected (new selection)
- Double-click selected submodule port row → drilled
- Double-click selected external card → navigate to that module's canvas
- Click `[Drill In]` button → drilled (primary card) or navigate (external card)
- All idle-state canvas interactions remain active (pan, zoom, drag external cards)
