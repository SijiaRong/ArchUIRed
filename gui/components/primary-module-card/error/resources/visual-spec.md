# Primary Module Card Error — Visual Specification

```
┌─────────────────────────────────────┐  ← 1px border, status/error (red)
│  ⚠ module-folder-name           [↗] │  ← warning icon replaces status dot
├─────────────────────────────────────┤
│  ⚠ README.md missing               │  ← error message in body
│    or frontmatter unparseable       │
└─────────────────────────────────────┘
```

- **Border:** 1px, `status/error` (`#ef4444`)
- **Header icon (⚠):** replaces the status dot; `status/error` color
- **Header text:** folder name (since `name` frontmatter may be unavailable); `text/primary`
- **Body:** short error message describing the parse failure (not the module description)
- **Background:** unchanged from Default

## When Applied

Applied when:
- The module folder exists but contains no `README.md`
- The `README.md` exists but YAML frontmatter is missing or unparseable
- The `uuid` field is absent from frontmatter

The node is still rendered so the user can see and fix the problem in-app.

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Error`
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
