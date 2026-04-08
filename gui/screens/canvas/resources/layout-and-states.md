# Canvas Screen Layout and State Machine

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ArchUI › GUI › Canvas                          [Sync] [Settings]   │  ← topbar
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐                                       ┌──────────┐  │
│  │ ExtCard  │     ┌────────────────────────────┐    │ ExtCard  │  │
│  │ name     │────►│  PRIMARY CARD              │◄───│ name     │  │
│  │ uuid     │     │  Module Name               │    │ uuid     │  │
│  └──────────┘     │  a1b2c3d4                  │    └──────────┘  │
│                    │                            │                   │
│  ┌──────────┐     │◀ Description text     ▶│    ┌──────────┐  │
│  │ ExtCard  │────►│                            │───►│ ExtCard  │  │
│  │ name     │     ├────────────────────────────┤    │ name     │  │
│  │ uuid     │     │ ◀ Sub-A       Sub-B ▶│    │ uuid     │  │
│  └──────────┘     │ ◀ Sub-C                    │    └──────────┘  │
│                    └────────────────────────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- **Topbar:** Breadcrumb navigation (always visible) + Sync button + Settings button.
- **Canvas area:** Infinite canvas with one primary card and zero or more external cards.
- **Primary card:** The focused module rendered as a large card:
  - Header: module name as title, UUID as dimmed identifier.
  - Description section: description text with module-level handles (◀ left for incoming, ▶ right for outgoing). Handles only appear when the focused module itself has external links in that direction.
  - Port section: submodule rows with port handles, showing only submodules that have external links.
- **External reference cards:** Small rectangular cards for modules linked to/from the primary card at either module or submodule level. Show full module name and dimmed UUID.
- **Detail panel:** Slides in from the right when a node is selected (node-selected state). Hidden in idle and drilled states.

## Rendering Level Rules

A single rendering level contains exactly:

1. **One primary card** — the currently focused module.
2. **Zero or more external reference cards** — modules outside the current hierarchy that are linked to or from the focused module or its submodules.
3. **Link edges** — in two categories:
   - **Direct edges** — between the primary card's module-level handles (description section) and external cards, for the focused module's own links.
   - **Port edges** — between submodule port handles (port section) and external cards, for submodule links.

## Same-Card Rendering Rule

When both endpoints of a link resolve to handles on the same card, the link is **not drawn** at this canvas level. This is a rendering-only decision — the underlying link data is fully valid. Submodules may link to siblings, to their parent, or vice versa. Such links become visible as cross-card edges when the user drills in.

## Non-Overlap Constraint

All cards on the canvas — primary and external — must never overlap. The layout engine enforces collision avoidance during initial placement and drag operations.

## State Machine

```
landing ──open project──► idle
                           │
              single-click │◄──── click empty space ────┐
                           ▼                             │
                     node-selected ──double-click──► drilled
                                                         │
                              ◄── breadcrumb / back ─────┘
```

See child state modules for full transition tables.

## Figma Node

- **Page:** Canvas Layouts (in the ArchUI Design System Figma file, key `beEbYQhz9LBLHrAj2eGyft`)
- **Frames:** `Canvas Layouts / Canvas-Idle`, `Canvas Layouts / Canvas-NodeSelected`, `Canvas Layouts / Canvas-Drilled`
