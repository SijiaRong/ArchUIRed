# Breadcrumb — Visual Specification

```
ArchUI  ›  GUI  ›  Screens  ›  Canvas
  ↑             ↑             ↑
 root         mid-crumbs    current (non-clickable)
```

- **Root crumb:** Always "ArchUI" (the repository root). Never removed.
- **Mid-crumbs:** Clickable; navigate directly to that canvas depth (truncating the stack).
- **Current crumb:** The last item; non-clickable; rendered in `text/primary` weight; represents the currently focused module.
- **Separator:** `›` character, `text/tertiary` color, 8px horizontal margin on each side.
- **Overflow:** When the trail exceeds available width, middle crumbs collapse into `…` with a dropdown to show hidden crumbs.

## Interaction

| Action | Result |
|--------|--------|
| Click any mid-crumb | Jump to that canvas depth (pops navigation stack to that point) |
| Click root crumb | Return to root canvas |
| Hover a crumb | Tooltip showing full path |
| Click `…` overflow indicator | Dropdown listing hidden crumbs |

## Figma Node

- **Component:** `Nav/Breadcrumb/Default`
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
