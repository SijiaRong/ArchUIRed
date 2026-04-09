# Primary Module Card Visual Anatomy

## Card Types

There are two card types rendered on the canvas at any given level:

1. **Primary Card** — the single large card representing the focused module.
2. **External Reference Card** — small cards for modules linked to/from the focused module but outside its hierarchy.

---

## Primary Card — Full Anatomy

### All sections present (module-level links + submodule links + commands)

```
┌───────────────────────────────────────────────────┐
│  ●  Module Name                              [↗]  │  A: Header section
│     a1b2c3d4-e5f6-7890-abcd-ef1234567890         │     A1: Status dot
├───────────────────────────────────────────────────┤     A2: Module name (typography/node-name)
│                                                   │     A3: UUID (typography/ui-meta, dimmed)
│◀  One-sentence description from the           ▶  │  B: Description section
│   SPEC.md / README.md frontmatter.               │     B1: Description text (typography/node-description)
│                                                   │     B2: Target handle ◀ (left edge, conditional)
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤     B3: Source handle ▶ (right edge, conditional)
│ ◀  Submodule-A                                   │  C: Port section
│                    Submodule-B (out)          ▶  │     C1: Port divider (1px dashed)
│ ◀  Submodule-C      Submodule-C (out)        ▶  │     C2: Port rows (one per linked submodule direction)
│    +2 more ▾                                     │     C3: Overflow indicator (when > 6 rows)
├───────────────────────────────────────────────────┤
│  ↺ Convert   📋 Summarise   ✓ Validate           │  D: Command bar (conditional)
└───────────────────────────────────────────────────┘     D1: Command bar divider (1px solid)
                                                          D2: Command buttons (one per .archui/commands/*.md)
```

### Section Visibility Rules

| Section | Rendered when |
|---|---|
| A — Header | Always |
| B — Description | Collapsed at rest (height 0), expanded on hover/selection |
| B2 — Target handle ◀ | An external module links TO the focused module |
| B3 — Source handle ▶ | The focused module has an outgoing link to an external module |
| C — Port section | At least one direct submodule has an external link |
| C2 — Port row (target ◀) | A submodule is linked TO by an external module |
| C2 — Port row (source ▶) | A submodule links OUT to an external module |
| C3 — Overflow indicator | Port section has > 6 rows |
| D — Command bar | Module has ≥ 1 file in `.archui/commands/` |

### Minimal layout (no external links, no commands)

```
┌───────────────────────────────────────────────────┐
│  ●  Module Name                              [↗]  │  A: Header
│     a1b2c3d4-...                                  │
├───────────────────────────────────────────────────┤
│   One-sentence description.                       │  B: Description (no handles)
└───────────────────────────────────────────────────┘
```

---

## Section Dimensions

| Section | Height | Token |
|---|---|---|
| A — Header | 36px | `dimension/node-header-height` |
| B — Description (collapsed) | 0px | — |
| B — Description (expanded) | 52px | `dimension/node-body-height` |
| C1 — Port divider | 1px | `dimension/node-divider-height` |
| C2 — Each port row | 28px | `dimension/port-row-height` |
| D — Command bar | 36px + button rows | (content-sized, min 36px) |
| Card width | 240px (fixed) | `dimension/node-width` |

---

## Section Details

### A — Header

- **Status dot (A1):** 6px circle. Color reflects module git status: `color/status/clean` (gray), `color/status/modified` (amber), `color/status/error` (red, replaced by ⚠ icon).
- **Module name (A2):** `typography/node-name` (14px, 600), `color/text/primary`. Truncated with ellipsis if overflow.
- **UUID (A3):** `typography/ui-meta` (11px, 400), `color/text/tertiary`. Always visible.
- **Drill-in icon [↗] (A4):** 16×16px, trailing edge. Opacity 0.4 at rest, 1.0 on hover and in selected state. Clicking navigates into the module.

### B — Description Section

- **Description text (B1):** `typography/node-description` (13px, 400), `color/text/secondary`. From `description` frontmatter field.
- **Target handle ◀ (B2):** Centered on left card edge at Y = 62px from card top. Shown only when external modules link TO this focused module. Handle ID: `module-{uuid}-in`.
- **Source handle ▶ (B3):** Centered on right card edge at Y = 62px from card top. Shown only when this module has outgoing links to external modules. Handle ID: `module-{uuid}-out`.

At rest, description height is 0 (collapsed). The title expands to 22px to fill the space visually (title-reveal animation). On hover or selection the description expands to `dimension/node-body-height` = 52px.

### C — Port Section

Lists direct submodules that have external links. Each row shows the submodule name and one or two handles:

- **Target port (C2 ◀):** handle on left edge, `port-{subUuid}-in`. Label uses `color/text/tertiary`. Shown when an external module links TO the submodule.
- **Source port (C2 ▶):** handle on right edge, `port-{subUuid}-out`. Label uses `color/port/{n}` (round-robin color). Shown when the submodule links OUT to an external module.
- **Dual row:** same submodule name appears on both left and right when it has both incoming and outgoing external links.

Port handle Y positions from card top: `103 + i × 28` px (i = 0-indexed row number).

Double-clicking a port row drills into that submodule.

### D — Command Bar

- Shown only when the module has ≥ 1 file in `.archui/commands/`.
- One button per command file. Buttons wrap to multiple rows if needed.
- Button states: Default, Hover, Active (agent running, spinner), Disabled.
- Only one command can run at a time; all buttons across the canvas disable while an agent task is active.

---

## External Reference Card — Anatomy

```
┌────────────────────────┐
│  Module Name           │  E1: Name (typography/node-name)
│  e5f6a7b8              │  E2: UUID (typography/ui-meta, more dimmed)
└────────────────────────┘
○                           E3: Handle (single, on left or right edge)
```

- **Name (E1):** Full module name. `typography/node-name` (14px, 600), `color/text/primary`.
- **UUID (E2):** `typography/ui-meta` (11px, 400), `color/text/tertiary`. Provides stable reference identity.
- **Handle (E3):** Single 8px circle. On **left edge** if the external module is a link target (incoming); on **right edge** if it is a link source (outgoing).

External reference cards are flat (no shadow), draggable, and smaller than the primary card.

---

## State Variant Summary

| State | Border | Background | Header accent | Shadow |
|---|---|---|---|---|
| Default | 1px `color/border/subtle` | `color/surface/default` | none | `elevation/card/default` |
| Selected | 2px `color/border/focus` | `color/interactive/selected-bg` | none | `elevation/card/selected` |
| Modified | 1px `color/border/subtle` | `color/surface/default` | 2px amber bottom bar | `elevation/card/default` |
| Error | 2px `color/status/error` | error-subtle tint | ⚠ icon replaces dot | 0 0 0 3px rgba(239,68,68,0.15) |

---

## Interaction Behaviors

### Primary Card

| Interaction | Behavior |
|---|---|
| Single-click (card body) | Enter selected state; detail panel opens |
| Double-click (port row) | Drill into that submodule |
| Click [↗] icon | Drill into focused module (same as double-click) |
| Hover | Description expands via title-reveal animation; handles become visible |
| Drag | Not draggable (anchored as focal element) |

### External Reference Card

| Interaction | Behavior |
|---|---|
| Single-click | Enter selected state; detail panel opens with external module summary |
| Double-click | Navigate to the canvas level where this module is the primary card |
| Drag | Reposition on canvas; new position saved to `.archui/layout.yaml` |

---

## Same-Card Rendering Rule

When both endpoints of a link resolve to handles on the same card at the current canvas level, **no edge is drawn**. This is a rendering-only exclusion. The link data is valid and becomes visible when the user drills into the appropriate parent module.

---

## Non-Overlap Constraint

All cards — primary and external — must never overlap. The layout engine enforces collision-free placement during initial layout and drag operations.
