# Canvas Screen — Layout and States

---

## State Summary

| State | Defining characteristics | Detail panel | `selectedUuid` | `navStack` |
|---|---|---|---|---|
| **idle** | Canvas visible, no selection, panel hidden | Hidden | null | current path |
| **node-selected** | One card selected, detail panel open | Visible (320px, right) | set to selected UUID | current path |
| **drilled** | Canvas re-rendered at a new module level (transient 200ms, then settles to idle) | Hidden (dismissed during drill) | null (cleared) | grows by 1 |

---

## Full State Machine Diagram

```
                          ┌──────────────────────────────────────────────────────────────────┐
                          │                         CANVAS STATE MACHINE                      │
                          └──────────────────────────────────────────────────────────────────┘

  project open ──────────────────────────────────────────────► idle
                                                                 │
                           ┌─────────────────────────────────────┤
                           │                                      │
                    single-click card                    double-click port row ──────────────────────────────┐
                           │                                      │                                          │
                           ▼                                      │                                          ▼
                    node-selected                                 │                                       drilled
                           │                                      │                                    (deeper level)
              ┌────────────┼──────────────┐                      │                                          │
              │            │              │                       │                                          │
     click    │  click     │  double-     │                       │                    ┌─────────────────────┤
     empty    │  different │  click       │                       │                    │                     │
     canvas   │  card      │  port row    │                       │          Escape /  │  breadcrumb    single-click
     or       │  (re-sel.) │              │                       │          Backspace │  crumb click   card
     Escape   │            │              │                       │          (no sel.) │                     │
              │            │              │                       │                    ▼                     ▼
              ▼            │              ▼                       └──────────────► drilled             node-selected
             idle ◄────────┘           drilled ◄──────────────────────────────  (parent level)
              │                           │
              └─────────────────── ◄──────┘
                   (Escape/breadcrumb back to idle at parent)
```

### All Transitions at a Glance

| From | Trigger | To |
|---|---|---|
| idle | single-click card | node-selected |
| idle | double-click port row | drilled |
| idle | double-click external card | idle (external module's parent canvas) |
| idle | Cmd+K → select result | idle (result's canvas) |
| idle | drag external card (mouse-up) | idle (same level, position updated) |
| node-selected | click empty canvas or Escape | idle |
| node-selected | single-click different card | node-selected (new selection) |
| node-selected | double-click port row | drilled |
| node-selected | click panel submodule row | idle→node-selected at new level |
| drilled | single-click card | node-selected |
| drilled | double-click port row | drilled (deeper) |
| drilled | Escape / Backspace (no selection) | drilled (parent) or idle at root |
| drilled | breadcrumb crumb click | drilled (ancestor level) or idle at root |

---

## Layout Diagrams

### Idle State

```
┌────────────────────────────────────────────────────────────────────────┐
│  topbar (48px)                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  breadcrumb (32px): ArchUI  ›  GUI  ›  Canvas       [Sync] [⚙]  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  canvas area  (100vw × (100vh − 80px))                                 │
│                                                                        │
│   ┌──────────┐                                       ┌──────────┐     │
│   │ ExtCard  │────────────────────────────────────►  │ ExtCard  │     │
│   │ name     │         ┌────────────────────┐        │ name     │     │
│   │ uuid     │         │  PRIMARY CARD      │        │ uuid     │     │
│   └──────────┘    ◄────│  Module Name       │────►   └──────────┘     │
│                        │  a1b2c3d4          │                         │
│   ┌──────────┐         ├────────────────────┤        ┌──────────┐     │
│   │ ExtCard  │    ◄────│ ◀ Sub-A            │        │ ExtCard  │     │
│   │ name     │         │        Sub-B ▶     │────►   │ name     │     │
│   │ uuid     │         └────────────────────┘        │ uuid     │     │
│   └──────────┘                                       └──────────┘     │
│                                                                        │
│  No panel. All interactions active: pan, zoom, select, drill, drag.    │
└────────────────────────────────────────────────────────────────────────┘
```

### Node-Selected State

```
┌───────────────────────────────────────────────┬────────────────────────┐
│  topbar (48px)                                │                        │
│  breadcrumb: ArchUI › GUI › Canvas  [Sync][⚙] │                        │
├───────────────────────────────────────────────┤  Detail Panel (320px)  │
│                                               │  ────────────────────  │
│  canvas area  ((100vw − 320px) × (100vh−80px))│  Module Name           │
│                                               │  a1b2c3d4              │
│   ┌──────────┐                               │                        │
│   │ ExtCard  │    ┌────────────────────┐      │  Description of the    │
│   │ name     │    │  PRIMARY CARD      │      │  module, wrapping      │
│   │ uuid     │    │  Module Name  [sel]│      │  naturally.            │
│   └──────────┘    │  a1b2c3d4          │      │  ────────────────────  │
│                   │  [2px blue border] │      │  SUBMODULES (2)        │
│                   ├────────────────────┤      │  ›  Sub-Alpha          │
│                   │ ◀ Sub-A            │      │  ›  Sub-Beta           │
│                   │        Sub-B ▶     │      │  ────────────────────  │
│                   └────────────────────┘      │  LINK TO (1)           │
│                                               │  [depends-on] Target   │
│  Click empty or Escape → back to idle         │                        │
└───────────────────────────────────────────────┴────────────────────────┘
```

### Drilled State (settling to idle at new level)

```
┌────────────────────────────────────────────────────────────────────────┐
│  topbar (48px)                                                         │
│  breadcrumb: ArchUI  ›  GUI  ›  Canvas  ›  Sub-Module   [Sync] [⚙]    │
│                                           ^^^^^^^^^^^^^^               │
│                                           new crumb appended           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  canvas area — now showing Sub-Module as the primary card              │
│                                                                        │
│   ┌──────────┐                                       ┌──────────┐     │
│   │ ExtCard  │         ┌────────────────────┐        │ ExtCard  │     │
│   │ (parent  │    ◄────│  Sub-Module         │────►   │ other    │     │
│   │  module) │*        │  (new primary)      │        │ ext refs │     │
│   └──────────┘         ├────────────────────┤        └──────────┘     │
│                        │ ◀ Grandchild-A      │                         │
│                        └────────────────────┘                         │
│                                                                        │
│  * Entry flash: parent module card highlights for 1s (if visible)     │
│  Escape / Backspace → back to Canvas level                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Structural Invariants

The following rules hold in all three states:

1. **Exactly one primary card** is rendered at any level. The primary card is always the module at the tail of `navStack`.
2. **External reference cards** appear only for modules that are linked to or from the primary card (or its submodules) but are not in the primary card's module hierarchy at the current level.
3. **Same-card link suppression:** When both endpoints of a link resolve to the same card, no edge is drawn. The link data is valid and becomes visible after drilling in.
4. **Non-overlap:** No two cards may overlap at any time. Auto-layout and the drag engine both enforce collision-free placement.
5. **Breadcrumb reflects navStack:** The breadcrumb trail always displays exactly `navStack.length` crumbs, one per entry, from root (leftmost) to current (rightmost).

---

## Figma Reference

- **File key:** `beEbYQhz9LBLHrAj2eGyft`
- **Page:** `Canvas Layouts`
- **Frames:**
  - `Canvas Layouts / Canvas-Idle`
  - `Canvas Layouts / Canvas-NodeSelected`
  - `Canvas Layouts / Canvas-Drilled`
