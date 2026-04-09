# Writing `.archui/layout.yaml`

Every module folder must contain `.archui/layout.yaml`. This file stores canvas node positions for the GUI — where child nodes appear when this module is opened as a canvas view. Layout data must never be placed inside `index.yaml`.

## Formats

There are two forms, determined by whether the module has children.

### Parent form (module has submodules)

Used when the module declares one or more entries in its `index.yaml` `submodules` map. Each UUID key corresponds to a child module (or the module itself as the origin node).

```yaml
layout:
  <uuid>:
    x: "0"
    y: "0"
  <child-uuid>:
    x: "200"
    y: "200"
```

- The top-level key is always `layout`.
- Each entry maps a UUID to an `{x, y}` position.
- Values are **string-quoted numbers** (e.g., `"200"`, `"-335.86"`).

### Leaf form (module has no submodules)

Used when the module has `submodules: {}` in its `index.yaml`.

```yaml
nodes: {}
viewport:
  zoom: 1
  pan: {x: 0, y: 0}
```

- `nodes` is an empty map.
- `viewport` records the default canvas view state.

### Empty form

An empty layout file is also valid for modules with no canvas state:

```yaml
{}
```

## Field Reference

### Parent form fields

| Field | Type | Description |
|---|---|---|
| `layout` | map | Top-level key. Maps UUIDs to positions. |
| `layout.<uuid>.x` | string | Horizontal canvas position in pixels. |
| `layout.<uuid>.y` | string | Vertical canvas position in pixels. |

### Leaf form fields

| Field | Type | Description |
|---|---|---|
| `nodes` | map | Empty map (`{}`). |
| `viewport.zoom` | number | Canvas zoom level (default `1`). |
| `viewport.pan.x` | number | Horizontal pan offset. |
| `viewport.pan.y` | number | Vertical pan offset. |

## UUID Quoting

Same rule as `index.yaml`: quote UUIDs that YAML might parse as numbers or scientific notation.

```yaml
layout:
  "785e2416":
    x: "0"
    y: "0"
  "0e947f97":
    x: "200"
    y: "200"
```

## Node Placement Rules

The validator checks for node overlap using these defaults:

| Parameter | Value |
|---|---|
| Default node width | 220 px |
| Default node height | 120 px |
| Overlap threshold | 200 px² |
| Recommended padding | 40 px between nodes |

When adding a new node, place it at a position that does not overlap any existing node bounding box. A simple strategy: scan existing positions and offset by at least `260` px horizontally or `160` px vertically from the nearest node.

## Examples

### SPEC module with one harness child

```yaml
layout:
  76d5c149:
    x: "0"
    y: "0"
  "0e947f97":
    x: "200"
    y: "200"
```

### Module with multiple children (grid layout)

```yaml
layout:
  "8250301b":
    x: "0"
    y: "0"
  "441217aa":
    x: "-500"
    y: "200"
  6aea7af7:
    x: "-240"
    y: "200"
  bc99257e:
    x: "20"
    y: "200"
  5ae7bd27:
    x: "280"
    y: "200"
```

### Leaf module (no children)

```yaml
nodes: {}
viewport:
  zoom: 1
  pan: {x: 0, y: 0}
```

## Anti-Patterns

| Don't | Do |
|---|---|
| Put layout data inside `index.yaml` | Use a separate `.archui/layout.yaml` |
| Use numeric values in the parent form | String-quote: `x: "200"` not `x: 200` |
| Stack nodes at the same coordinates | Offset by at least 260 px horizontal or 160 px vertical |
| Omit the file entirely | Every module must have `.archui/layout.yaml` |

## Relevant Validation Codes

| Code | Severity | Meaning |
|---|---|---|
| `structure/missing-layout` | error | `.archui/layout.yaml` not found |
| `layout/node-overlap` | warn | Two node bounding boxes overlap by more than 200 px² |
| `index/forbidden-layout-field` | error | `layout` key found in `index.yaml` instead of `layout.yaml` |
