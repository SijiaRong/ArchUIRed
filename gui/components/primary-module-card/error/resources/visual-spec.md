# Primary Module Card Error — Visual Specification

## Primary Card — Error

```
╔══════════════════════════════════════════════════╗  ← 2px border, color/status/error (red)
║  ⚠  module-folder-name                     [↗] ║  ← ⚠ replaces status dot; folder name in italic
║     (name unavailable)                          ║  ← header bg: subtle red tint
╠══════════════════════════════════════════════════╣
║  ⚠  README.md missing                          ║  ← error message in body zone
║     (or: Frontmatter parse error)              ║     color/status/error, 12px
╚══════════════════════════════════════════════════╝
         ↑ box-shadow: 0 0 0 3px rgba(239,68,68,0.15)
```

### Visual Token Table — Primary Card (Error)

| Property | Default value | Error override | Token |
|---|---|---|---|
| Border width | 1px | **2px** | — |
| Border color | `color/border/subtle` | **`color/status/error`** | `#EF4444` |
| Background | `color/surface/default` | **error-subtle tint** | light: `#FEF2F2` dark: `#2D1515` |
| Header background | `color/surface/default` | **same as card background** | error-subtle tint |
| Status dot | 6px `color/status/clean` | **replaced by ⚠ icon** | `color/status/error` |
| Box-shadow | `elevation/card/default` | **0 0 0 3px rgba(239,68,68,0.15)** + drop shadow | — |
| Title text | module `name` | **folder basename (italic)** | `color/text/primary` |
| Body content | description | **error message text** | `color/status/error`, 12px |

## Error Icon (⚠)

- Replaces the 6px status dot in the header.
- Size: 14×14px SVG warning triangle.
- Color: `color/status/error` (`#EF4444`).
- Positioned in the same leading slot as the status dot.

## Error Message in Body Zone

Short single-line message (or two lines if needed). Styled with:
- Font: `typography/node-description` (13px, 400)
- Color: `color/status/error` (`#EF4444`)
- Leading ⚠ character before the message text

## Error Message Catalog

| Cause | Displayed text |
|---|---|
| README.md / SPEC.md / HARNESS.md missing | `README.md missing` |
| Frontmatter cannot be parsed | `Frontmatter parse error` |
| Required field absent | `Missing field: uuid` (or `name` / `description`) |
| Duplicate UUID | `Duplicate UUID: <uuid>` |

Only the first error is shown inline. The detail panel shows all validation errors when the node is selected.

## When Applied

Applied when any of the following occur:
- The module folder contains no identity document (`SPEC.md`, `README.md`, etc.)
- The identity document exists but its YAML frontmatter is missing or unparseable
- Required frontmatter fields (`uuid`, `name`, `description`) are absent or malformed

The node always renders in error state so the user can locate and fix it in-app.

## Interaction in Error State

- The node remains selectable and clickable.
- Single-click opens the detail panel showing the full validation error list and a **Fix** shortcut (opens the identity document in the default editor).
- The [↗] drill-in icon remains functional — drilling in shows a blank detail panel with the raw error.

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Error`
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
