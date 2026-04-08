# Primary Module Card — Error State Spec

## What Triggers the Error State

A node enters error state when any of the following occur:
- `README.md` is missing from the module folder.
- `README.md` exists but cannot be parsed as valid YAML frontmatter.
- Required frontmatter fields (`uuid`, `name`, `description`) are absent or malformed.

## Visual Treatment

```
border: 2px solid token(status-error)       /* #EF4444 red-500 */
background: token(surface-error-subtle)     /* #FEF2F2 light / #2D1515 dark */
box-shadow: 0 0 0 3px rgba(239,68,68,0.15)
```

## Anatomy

```
┌═════════════════════════════════════┐  ← 2px red border
│  ●  [folder-name]            [↗]   │  header: folder name used (no README name)
│     color-dot=red                   │
├─────────────────────────────────────┤
│  ⚠ README.md missing                │  error message in body area
│  (or: "Frontmatter parse error")    │  12px, token(status-error) color
└═════════════════════════════════════┘
```

Header fallback: when `name` is not parseable, use the folder's basename in italic.
Drill-in icon `[↗]` remains functional — drilling in shows a blank detail panel with the raw error.

## Error Messages

| Cause                        | Displayed text                             |
|------------------------------|--------------------------------------------|
| README.md missing            | `README.md missing`                        |
| Frontmatter parse error      | `Frontmatter parse error`                  |
| Missing required field       | `Missing field: uuid` (or name/description)|
| UUID duplicate               | `Duplicate UUID: <uuid>`                   |

Only the first error is shown inline. Full validation output is in the detail panel.

## Color Dot

Always red (#EF4444) regardless of git status — error state overrides all other status signals.

## Interaction

Error nodes are still selectable and clickable. The detail panel in node-selected state shows
the full error details and a "Fix" shortcut that opens the README.md in the default editor.
