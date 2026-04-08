# Navigation — Breadcrumb Spec

## Layout

The breadcrumb trail is a horizontal bar pinned to the top of the canvas viewport, below
the main topbar (if any). It is always visible while any canvas is open.

```
┌────────────────────────────────────────────────────────────┐
│  ArchUI  ›  GUI  ›  Screens  ›  Canvas                    │  ← breadcrumb bar
└────────────────────────────────────────────────────────────┘
```

## Dimensions

```
height: 32px
padding: 0 16px
background: token(surface-topbar)    /* #F9FAFB light / #111827 dark */
border-bottom: 1px solid token(border-subtle)
font-size: 13px
```

## Crumb Element

```
[crumb-label]  ›  [crumb-label]  ›  [current-label]
```

- Separator `›`: 10px wide, token(text-tertiary) color, non-clickable.
- Intermediate crumbs: token(text-link) color, underline on hover, cursor pointer.
- Current crumb (last): token(text-primary), no underline, cursor default, font-weight 500.
- Root crumb: always "ArchUI", links to root canvas.

## Overflow Behavior

When the breadcrumb exceeds the available bar width:
1. Middle crumbs are collapsed into a `…` ellipsis button.
2. The first crumb (root) and last crumb (current) always remain visible.
3. Clicking `…` expands a dropdown showing hidden intermediate crumbs.

```
ArchUI  ›  …  ›  Canvas
              ↓ (on click)
         GUI
         Screens
```

## Interaction

| Action                        | Result                                      |
|-------------------------------|---------------------------------------------|
| Click intermediate crumb      | Navigate to that depth (truncate stack)     |
| Click root crumb              | Navigate to project root canvas             |
| Click `…` expand button       | Show hidden crumbs in dropdown              |
| Click hidden crumb in dropdown| Navigate to that depth                      |
| Keyboard Tab                  | Focusable, Enter activates click behavior   |

## Animation

When a new crumb is added (drill-in), the new crumb slides in from the right:
- Animation: opacity 0→1 + translateX(8px→0), 120ms ease-out.

When crumbs are removed (back navigation):
- Removed crumbs fade out: opacity 1→0, 80ms ease-in.
