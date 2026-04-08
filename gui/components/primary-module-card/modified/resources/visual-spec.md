# Primary Module Card Modified — Visual Specification

```
┌──┬──────────────────────────────────┐
│▌▌│ ● module-name               [↗] │  ← amber left-border accent (4px)
├──┴──────────────────────────────────┤
│  One-sentence description from      │
│  the README.md frontmatter.         │
└─────────────────────────────────────┘
```

- **Left border accent:** 4px solid `status/modified` (amber, `#f59e0b`)
- **Header status dot (●):** `status/modified` color
- **Border:** 1px, `border/subtle` (unchanged from Default)
- **Background:** unchanged from Default

## When Applied

Applied when the module's folder contains files with uncommitted changes according to `git status`. The GUI polls git status on a short interval (or on filesystem events) to keep this state current.

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Modified`
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
