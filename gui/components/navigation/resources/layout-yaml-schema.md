# `.archui/layout.yaml` Schema

Canvas node positions, zoom level, and pan offset are stored in `.archui/layout.yaml` at the **project root**. This file is a single global file — there is one `layout.yaml` for the entire project, not one per module.

---

## YAML Structure

```yaml
# .archui/layout.yaml

<parent-module-uuid>:
  nodes:
    <submodule-uuid>: { x: 120, y: 340 }
    <submodule-uuid>: { x: 420, y: 200 }
  viewport:
    zoom: 1.0
    pan: { x: 0, y: 0 }
```

Top-level keys are **parent module UUIDs** (the canvas currently being viewed). Each value is an object with two sub-keys:

- `nodes` — a map of submodule UUID → `{ x, y }` card position in canvas coordinates.
- `viewport` — the zoom level and pan offset last set by the user for this canvas.

---

## Field Definitions

### `nodes` (required if any positions are known)

A map of `<submodule-uuid>` → position object.

| Field | Type    | Constraints             | Description                                           |
|-------|---------|-------------------------|-------------------------------------------------------|
| `x`   | integer | any, default `0`        | Horizontal position in canvas pixels from left origin |
| `y`   | integer | any, default `0`        | Vertical position in canvas pixels from top origin    |

- Keys are UUID strings matching submodule UUIDs listed in `index.yaml`.
- Values use integer pixels. Fractional pixels are rounded on write.
- Missing entries fall back to auto-layout (grid). Auto-layout positions are written on first save.

### `viewport` (required if the user has zoomed or panned)

| Field         | Type   | Constraints              | Description                                        |
|---------------|--------|--------------------------|----------------------------------------------------|
| `zoom`        | float  | `0.1` – `4.0`            | Multiplicative zoom scale. `1.0` = 100%.           |
| `pan`         | object | —                        | Canvas pan offset in screen pixels.                |
| `pan.x`       | float  | any                      | Horizontal pan offset (positive = panned right).   |
| `pan.y`       | float  | any                      | Vertical pan offset (positive = panned down).      |

- `zoom` default: `1.0`
- `pan` default: `{ x: 0, y: 0 }`

---

## Example File

```yaml
# .archui/layout.yaml

# root canvas
"3f8a1c2d-4b5e-6f7a-8b9c-0d1e2f3a4b5c":
  nodes:
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890": { x: 80,  y: 120 }
    "b2c3d4e5-f6a7-8901-bcde-f12345678901": { x: 400, y: 120 }
    "c3d4e5f6-a7b8-9012-cdef-123456789012": { x: 240, y: 340 }
  viewport:
    zoom: 1.0
    pan: { x: 0, y: 0 }

# gui canvas
"d4e5f6a7-b8c9-0123-defa-234567890123":
  nodes:
    "e5f6a7b8-c9d0-1234-efab-345678901234": { x: 60,  y: 80  }
    "f6a7b8c9-d0e1-2345-fabc-456789012345": { x: 320, y: 80  }
  viewport:
    zoom: 1.25
    pan: { x: -40, y: 20 }
```

---

## Writer Rules

`gui/file-sync` is the **only** component that writes `layout.yaml`. No other component may write to this file.

### When the file is written

| Trigger                    | Fields written                                    |
|----------------------------|---------------------------------------------------|
| User drags a node          | `nodes.<uuid>` for the moved node, on drag-end    |
| User changes zoom level    | `viewport.zoom` for the current canvas            |
| User pans the canvas       | `viewport.pan` for the current canvas             |
| Auto-layout computed       | All `nodes` entries for the canvas, on first save |

Writes are debounced: drag-end triggers a single write, not one per frame. Zoom/pan writes are debounced by 300ms after the last gesture event.

### What is NOT written

- `layout.yaml` is never modified by the navigation module, the CLI validator, or any agent modification workflow.
- Positions for canvases the user has never opened are not written until the first open.

---

## Reader Rules

`layout.yaml` is read by the canvas renderer on canvas load:

1. When the user drills into a module (or loads a canvas), the renderer looks up the parent UUID.
2. If an entry exists: node positions are restored, viewport zoom and pan are applied.
3. If no entry exists for the canvas: positions are auto-generated (grid layout). Viewport resets to `zoom: 1.0`, `pan: { x: 0, y: 0 }`.
4. If an entry exists but specific submodule UUIDs are missing from `nodes`: missing nodes use auto-layout positions.

---

## Stale Entries

If `layout.yaml` contains a submodule UUID that no longer exists in the module graph (the module was deleted or moved):

- The entry is **silently ignored** by the renderer.
- It is NOT automatically removed from the file on read.
- `archui index --fix` prunes stale layout entries as a side effect of index repair.

If `layout.yaml` contains a parent UUID that no longer exists:

- The entire block is silently ignored.
- `archui index --fix` also prunes these stale top-level keys.

---

## Constraints and Rules

1. `layout.yaml` is located at the **project root** (same level as `.archui/index.yaml`). There is exactly one `layout.yaml` per project.
2. Layout data is **independent** from `index.yaml`. Canvas positions are not stored in any module's `.archui/index.yaml`.
3. `layout.yaml` is a **display hint only**. It has no effect on the module graph, link resolution, UUID assignment, or filesystem structure.
4. The file may be deleted safely; the canvas will fall back to auto-layout and rewrite it on the next save.
5. `layout.yaml` should be committed to version control so that canvas layouts are shared across collaborators and agent sessions.
