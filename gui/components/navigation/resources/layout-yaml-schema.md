# `.archui/layout.yaml` Schema

Canvas node positions are stored in `.archui/layout.yaml` at the project root.

## Format

```yaml
# .archui/layout.yaml
<parent-module-uuid>:
  <submodule-uuid>: { x: 120, y: 340 }
  <submodule-uuid>: { x: 420, y: 200 }
```

- Top-level keys are parent module UUIDs (the canvas being viewed).
- Each value is a map of submodule UUID → `{ x, y }` position in canvas coordinates (pixels from top-left origin).

## Writer

`gui/file-sync` writes this file when the user repositions a node. No other component writes it.

## Fallback

If a canvas has no entry in `layout.yaml`, or if specific submodule UUIDs are missing, positions are auto-generated (e.g., grid layout) and written to `layout.yaml` on the first save.

## Stale Entries

If `layout.yaml` contains a UUID that no longer exists as a module, the entry is silently ignored. `archui index --fix` prunes stale layout entries as a side effect.

This file is purely a display hint. It has no effect on the module graph, link resolution, or filesystem structure.
