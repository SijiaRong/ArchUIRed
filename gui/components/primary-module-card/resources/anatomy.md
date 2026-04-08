# Primary Module Card Visual Anatomy

## Primary Card (Focused Module)

### With both module-level and submodule-level links

```
┌───────────────────────────────────────────────────┐
│  Module Name                                      │  ← header: title
│  a1b2c3d4                                         │  ← header: uuid (dimmed)
├───────────────────────────────────────────────────┤
│                                                   │
│◀ One-sentence description from the          ▶│  ← description section
│  README.md frontmatter.                           │     with module-level handles
│                                                   │     (◀ left = incoming, ▶ right = outgoing)
├───────────────────────────────────────────────────┤  ← port divider
│ ◀ Submodule-A                    Submodule-B ▶│  ← port rows (externally-linked subs)
│ ◀ Submodule-C                                     │
│                                  Submodule-D ▶│
└───────────────────────────────────────────────────┘
```

### With only submodule-level links (no module-level links)

```
┌───────────────────────────────────────────────────┐
│  Module Name                                      │
│  a1b2c3d4                                         │
├───────────────────────────────────────────────────┤
│  One-sentence description from the                │  ← description section
│  README.md frontmatter.                           │     NO handles (module has no own links)
├───────────────────────────────────────────────────┤
│ ◀ Submodule-A                    Submodule-B ▶│
│ ◀ Submodule-C                                     │
└───────────────────────────────────────────────────┘
```

### With only module-level links (no submodule external links)

```
┌───────────────────────────────────────────────────┐
│  Module Name                                      │
│  a1b2c3d4                                         │
├───────────────────────────────────────────────────┤
│                                                   │
│◀ One-sentence description from the          ▶│  ← description section
│  README.md frontmatter.                           │     with module-level handles
│                                                   │
└───────────────────────────────────────────────────┘
     (no port section — no submodules with external links)
```

## Section Details

- **Header:** Displays `name` from frontmatter as a prominent heading. UUID in small, dimmed (low-contrast) text below or beside the title.
- **Description section:** Displays `description` from frontmatter. Module-level connection handles appear on the left/right edges of this section:
  - **◀ (module target handle)** on the left edge — shown only when external modules link TO this focused module. Hidden otherwise.
  - **▶ (module source handle)** on the right edge — shown only when this focused module links OUT to external modules. Hidden otherwise.
- **Port section:** Lists submodules that have at least one external link. Each row shows the submodule name with connection handles:
  - **◀ (target port)** on the left edge — the submodule is linked TO by an external module.
  - **▶ (source port)** on the right edge — the submodule links OUT to an external module.
  - A submodule can have both ◀ and ▶ if it has both incoming and outgoing external links.

## External Reference Card (Linked Module)

```
┌────────────────────┐
│  Module Name       │  ← full module name
│  e5f6a7b8          │  ← uuid: smaller, more dimmed
└────────────────────┘
  ○ (handle)
```

- **Name:** Full module name displayed as a compact label.
- **UUID:** Smaller and more dimmed than the primary card's UUID. Provides a stable reference without visual distraction.
- **Handle:** A single default handle — on the left edge if the external module is a link target (arrow points toward it), or on the right edge if it is a link source (arrow points away).

## Interaction Behaviors

### Primary Card

| Interaction | Behavior |
|-------------|----------|
| Single-click (body) | Select primary card; show detail panel with full README content |
| Double-click (submodule row) | Drill into that submodule — canvas re-renders with submodule as new primary card |
| Double-click (body, outside port rows) | No action (already at this module's level) |
| Drag | Not draggable — anchored as the focal element |

### External Reference Card

| Interaction | Behavior |
|-------------|----------|
| Single-click | Select card; show detail panel with external module's README summary |
| Double-click | Navigate to the canvas level where this module lives |
| Drag | Reposition on canvas; position saved to `.archui/layout.yaml` |

## Same-Card Rendering Rule

When both endpoints of a link resolve to handles on the same card, the link is **not drawn** at this canvas level. This is a rendering-only rule — the underlying link data is fully valid. Submodules are allowed to link to siblings, to their parent, or vice versa. Such links become visible as cross-card edges when the user drills into the appropriate module.

## Non-Overlap Constraint

All cards — primary and external — must be positioned without overlapping. The layout engine enforces this during initial placement and when the user drags external cards.
