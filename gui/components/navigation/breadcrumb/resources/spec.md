# Navigation — Breadcrumb Spec

## Layout

The breadcrumb is rendered inside the 48px topbar, vertically centred. It occupies the full available width of the topbar minus 16px of horizontal padding on each side.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  topbar (48px)                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ArchUI  ›  GUI  ›  Canvas                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

The breadcrumb component itself is 32px tall, centred in the topbar with 8px above and below.

## Root Crumb — Always Visible

The root crumb ("ArchUI") is always the first item in the trail. It is:

- Present from the moment the GUI opens.
- Never removed, hidden, or collapsed into the overflow `…` button — it is excluded from overflow truncation.
- Always clickable (navigates to the root canvas).
- The label is always the repository root display name, not a dynamic value.

## Crumb Click Navigation

Clicking any crumb (root or intermediate) navigates directly to that module's canvas:

- The navigation stack is truncated to the depth of the clicked crumb.
- Canvases for modules deeper than the clicked crumb are not retained.
- The previously focused node at the destination canvas is briefly highlighted to aid re-orientation.
- The current (rightmost) crumb is non-clickable — clicking it has no effect.

## Keyboard Accessibility

All clickable crumbs (root + intermediate) are keyboard-focusable tab stops:

- Tab order goes left to right through clickable crumbs.
- The current (rightmost) crumb is excluded from tab order (`tabindex="-1"` or equivalent).
- The overflow `…` button is a tab stop when visible.
- Enter / Space activates a focused crumb (same effect as a click).
- A visible focus ring is rendered around the focused crumb: 2px, `color/border/focus`, 2px offset.
- Items in the overflow dropdown are focusable; Escape closes the dropdown without navigation.

## Overflow Truncation

When the total rendered width of all crumbs plus separators exceeds the available bar width:

1. Root crumb and current crumb are kept visible.
2. All intermediate crumbs between root and current are collapsed into a single `…` overflow button.
3. Clicking `…` opens a dropdown panel listing the hidden crumbs in order from closest-to-root at the top.
4. Clicking a crumb in the dropdown navigates to that depth (same behaviour as a direct crumb click).
5. The `…` button is positioned between the root crumb separator and the current crumb separator.

```
ArchUI  ›  …  ›  Canvas
```

Overflow recalculation runs:
- On initial mount.
- When the window/viewport is resized.
- When the navigation stack changes length.

## Session Persistence Interaction

The breadcrumb reads its state from the navigation stack, which is restored from session storage on reload. The breadcrumb itself does not read from or write to session storage — that responsibility belongs to the navigation module. On restore, the breadcrumb renders the persisted trail immediately, with no animation (no slide-in on mount for pre-existing crumbs).

New crumbs added after mount (drill-in) do animate in.

## Animation

| Event        | Animation                                     | Duration   | Easing    |
|--------------|-----------------------------------------------|------------|-----------|
| Drill-in     | New crumb: opacity 0→1, translateX(8px→0)     | 120ms      | ease-out  |
| Back / jump  | Removed crumbs: opacity 1→0                   | 80ms       | ease-in   |
| Overflow `…` | Dropdown open: opacity 0→1, translateY(−4→0)  | 100ms      | ease-out  |
| Overflow `…` | Dropdown close: opacity 1→0                   | 60ms       | ease-in   |

## Rendering in Topbar Context

The breadcrumb is a child of the topbar component. Layout contract:

- The topbar is 48px tall and full viewport width.
- The breadcrumb is rendered in a flex row, vertically centred (`align-items: center`).
- Left edge: 16px from topbar left edge (`spacing/400`).
- Right edge: must not overflow the topbar; clip or trigger overflow truncation before reaching the topbar right edge.
- The topbar may also contain action buttons (e.g., sync, settings) on its right side. The breadcrumb must respect the space reserved for those buttons; it does not overlap them.

## Interaction Table

| Action                         | Result                                          |
|--------------------------------|-------------------------------------------------|
| Click root crumb               | Navigate to root canvas                         |
| Click intermediate crumb       | Navigate to that depth (truncate stack)         |
| Click current crumb            | No effect                                       |
| Click `…` overflow button      | Open dropdown with hidden crumbs                |
| Click crumb in dropdown        | Navigate to that depth                          |
| Hover any clickable crumb      | Underline, surface/hover background tint        |
| Keyboard Tab                   | Move focus left→right through clickable crumbs  |
| Keyboard Enter / Space         | Activate focused crumb (same as click)          |
| Keyboard Escape (dropdown open)| Close dropdown, return focus to `…` button      |
