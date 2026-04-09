# Primary Module Card — Error State Spec

## What Triggers the Error State

A node enters the error state when any of the following conditions are detected:

| Condition | Description |
|---|---|
| Missing identity document | No `SPEC.md`, `README.md`, `HARNESS.md`, or `MEMORY.md` in the module folder |
| Unparseable frontmatter | The identity document exists but its YAML front-matter block cannot be parsed |
| Missing required fields | `name`, `description`, or `uuid` is absent or blank in front-matter |
| Duplicate UUID | Another module already uses the same `uuid` value |

Error state always overrides all other status signals (modified, new, etc.).

## Visual Treatment

```
border:        2px solid color/status/error     (#EF4444)
background:    (light) #FEF2F2  (dark) #2D1515  (error-subtle tint)
box-shadow:    0 0 0 3px rgba(239,68,68,0.15),
               0 1px 3px rgba(0,0,0,0.08)
```

## Header Fallback

When `name` frontmatter cannot be read:
- Use the **folder basename** as the title text.
- Render the title in italic to signal fallback mode.
- UUID row is hidden (no UUID available to display).

When `name` is readable but another field is missing:
- Render the name normally.
- Status dot is replaced by the ⚠ icon regardless.

## Anatomy

```
╔════════════════════════════════════════════════╗
║  ⚠  module-folder-name (italic)          [↗] ║  header: ⚠ replaces dot; folder name
║                                               ║  (uuid row hidden if UUID unavailable)
╠════════════════════════════════════════════════╣
║  ⚠ README.md missing                          ║  body: error message
║                                               ║  color/status/error, 13px
╚════════════════════════════════════════════════╝
```

## Error Message Display Rules

1. Show only the **first** error inline inside the body zone.
2. The detail panel (opened via single-click / selection) shows the **full list** of validation errors.
3. A **Fix** button appears in the detail panel — it opens the identity document in the platform default editor.

## Error Messages

| Cause | Inline message | Code constant |
|---|---|---|
| README.md / SPEC.md missing | `README.md missing` | `ERR_IDENTITY_MISSING` |
| Frontmatter parse error | `Frontmatter parse error` | `ERR_FRONTMATTER_PARSE` |
| Missing `uuid` | `Missing field: uuid` | `ERR_MISSING_FIELD_UUID` |
| Missing `name` | `Missing field: name` | `ERR_MISSING_FIELD_NAME` |
| Missing `description` | `Missing field: description` | `ERR_MISSING_FIELD_DESC` |
| Duplicate UUID | `Duplicate UUID: <uuid>` | `ERR_DUPLICATE_UUID` |

## Color Dot Override

The status dot is always replaced by a ⚠ icon in error state. The icon color is always `color/status/error` (`#EF4444`), regardless of git status (modified, clean, new).

## Port Section in Error State

The port section is **not rendered** in the error state. Because the module identity is unreadable, its links and submodule relationships cannot be resolved. The card shows only the header and the error message body.

## Interaction

| Interaction | Behavior |
|---|---|
| Single-click | Enter selected state; detail panel shows full error list + Fix shortcut |
| Drill-in [↗] icon click | Navigate into the module; canvas shows blank primary card with error message |
| Hover | Standard hover overlay; no description to reveal (body shows error message instead) |
| Drag (if external reference) | Not applicable — error state only applies to primary module resolution |

## Recovery

When the user fixes the underlying problem (adds a missing file, repairs frontmatter):
- `FileSyncEngine` detects the file change.
- Module graph re-parses the folder.
- `module-status-changed` event emitted with new status.
- Canvas re-renders the node in its recovered state (default or modified) without reload.
