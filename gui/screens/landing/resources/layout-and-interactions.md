# Landing Screen Layout and Interactions

## Layout

```
┌─────────────────────────────────────────────┐
│                   ArchUI                    │  ← centered wordmark
├─────────────────────────────────────────────┤
│  Recent Projects                            │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │  project-name    │  │  project-name    │ │  ← recent project cards
│  │  ~/path/to/…     │  │  ~/path/to/…     │ │
│  └──────────────────┘  └──────────────────┘ │
│                                             │
│  [ Open Folder… ]   [ New Project ]         │  ← primary actions
└─────────────────────────────────────────────┘
```

## Interactions

| Action | Result |
|--------|--------|
| Click a recent project card | Loads project → transitions to canvas/idle |
| Click "Open Folder…" | Opens native folder picker → loads project → transitions to canvas/idle |
| Click "New Project" | Opens native folder picker to select empty folder → scaffolds new project → transitions to canvas/idle |

## Figma Node

- **Page:** Canvas Layouts (in the ArchUI Design System Figma file, key `beEbYQhz9LBLHrAj2eGyft`)
- **Frame:** `Canvas Layouts / Landing`
