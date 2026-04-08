# Detail Panel — Component Specification

## Overview

The Detail Panel is a fixed-width overlay panel anchored to the right edge of the canvas viewport. It slides in from the right when a module is selected and slides out when the selection is cleared. It provides a structured, navigable view of the selected module's metadata and relationships without leaving the canvas.

---

## Panel Dimensions and Positioning

| Property | Value | Token |
|----------|-------|-------|
| Width | 320px | `dimension/detail-panel-width` |
| Height | Full viewport height (100vh minus topbar) | — |
| Position | Fixed, anchored to right edge of viewport | — |
| Top offset | `dimension/topbar-height` (48px) | — |
| Z-index | Overlaps canvas content; does NOT push canvas | — |
| Layout behavior | Overlay — canvas layout is unaffected by panel open/close | — |

The panel does not reflow the canvas. It floats above the React Flow canvas at a fixed z-index.

---

## Background, Border, and Padding

| Property | Token | Value (Dark) | Value (Light) |
|----------|-------|-------------|--------------|
| Background | `color/surface/raised` | `#26262B` | `#FFFFFF` |
| Left border | `color/border/default` | `#3A3A42` | `#C8C8D0` |
| Border width | — | 1px | 1px |
| Horizontal padding | `spacing/5` | 20px | 20px |
| Top padding | `spacing/5` | 20px | 20px |
| Bottom padding | `spacing/8` | 32px | 32px |
| Section gap (between sections) | `spacing/8` | 32px | 32px |

---

## Section-by-Section Layout

### Header Section

The header is always visible when the panel is open. It is not collapsible.

#### Title

- **Content**: Module `name` from `README.md` frontmatter.
- **Font**: `text-xl`, 24px, bold (weight 700). Inter font.
- **Color**: The card's accent color — same deterministic color assigned to this module's primary card header. Color index is based on the module's position among its siblings at the current canvas level (same formula used by `ModuleNode`). Uses `color/port/*` palette (0–7 round-robin).
- **Opacity**: Full (1.0). Not dimmed.
- **Margin bottom**: `spacing/1` (4px) between title and UUID line.

#### UUID

- **Content**: First 8 hex characters of the module's UUID.
- **Font**: `typography/ui-meta` — 11px, Regular (400), line-height 16px, letter-spacing +0.1px.
- **Font family**: Monospace (e.g., `'JetBrains Mono', 'Fira Code', monospace`).
- **Color**: `color/text/primary` at `opacity: 0.45`.
- **Margin bottom**: `spacing/2` (8px) between UUID and description.

#### Description

- **Content**: `description` from `README.md` frontmatter.
- **Font**: `typography/ui-label` — 13px, Regular (400), line-height 18px.
- **Color**: `color/text/secondary`.
- **Wrapping**: Text wraps naturally to full panel width (minus horizontal padding).
- **Margin top**: `spacing/2` (8px) from UUID line.

---

### Submodules Section

**Visibility**: Shown only when the module has at least one declared submodule (`submodules` map in `.archui/index.yaml` is non-empty). If there are no submodules, this section is hidden entirely — no placeholder or empty state label is shown.

**Section header**: `"Submodules (N)"` where N is the count of submodule entries.

- Header uses `typography/ui-heading`: 12px, Semi Bold (600), line-height 16px, letter-spacing +0.4px, UPPERCASE.
- Color: `color/text/tertiary`.
- A horizontal rule (1px, `color/border/default`) is rendered above the header as a section separator.
- Margin above separator: `spacing/8` (32px) from the content above.
- Margin below header: `spacing/2` (8px) before the first row.

**Row structure** (one row per submodule):

```
[›]  [Submodule Name]
```

| Element | Detail |
|---------|--------|
| Arrow indicator `›` | `color/text/tertiary`, `typography/ui-label` (13px), fixed 16px left column, dimmed |
| Submodule name | `typography/ui-label` (13px), `color/text/primary` |
| Row height | Minimum 32px; auto-grows if name wraps |
| Row padding | `spacing/1` (4px) vertical, no extra horizontal |

**Hover behavior**: Show the submodule's `description` text as a tooltip or as inline secondary text below the name. Secondary text uses `typography/ui-meta` (11px), `color/text/secondary`.

**Click behavior**: Navigate canvas to the level where this submodule is visible (i.e., the selected module's canvas level), then select and centre the submodule's card. See "Navigation Behaviour on Row Click" section.

---

### Link to Section

**Visibility**: Shown only when the module has at least one outgoing link. Hidden entirely when empty.

**Section header**: `"Link to (N)"` where N is the count of outgoing link entries.

- Same header style as Submodules section: `typography/ui-heading`, UPPERCASE, `color/text/tertiary`.
- Horizontal rule separator above, `spacing/8` margin above separator.

**Row structure** (one row per link):

```
[relation-pill]  [Target Module Name]
                 [optional link description]
```

| Element | Detail |
|---------|--------|
| Relation label | `typography/ui-meta` (11px), `color/text/secondary`; rendered as a pill with `dimension/border-radius-small` (4px) background tint matching edge color for that relation type |
| Target module name | `typography/ui-label` (13px), `color/text/primary`. If UUID not found in project index: show raw UUID in mono font |
| Optional description | Only rendered if the link entry in `.archui/index.yaml` has a `description` field. `typography/ui-meta` (11px), `color/text/secondary`, below the target name |
| Row height | Minimum 32px; expands if description is present |

**Relation pill colors** (background tint at low opacity, text at full opacity):

| Relation | Pill text/border color token |
|----------|------------------------------|
| `depends-on` | `color/edge/depends-on` |
| `implements` | `color/edge/implements` |
| `extends` | `color/edge/extends` |
| `references` | `color/edge/references` |
| `related-to` | `color/edge/related-to` |
| custom | `color/edge/custom` |

**Hover behavior**: Show the target module's own `description` (from its `README.md`) as a tooltip or inline secondary text below the name.

**Click behavior**: Navigate canvas to the level where the target module is visible (its parent level), then select and centre the target's card. See "Navigation Behaviour on Row Click" section.

---

### Linked by Section

**Visibility**: Shown only when at least one other module in the project declares a link pointing to this module's UUID. Hidden entirely when empty.

**Section header**: `"Linked by (N)"` where N is the count of modules linking to this module.

- Same header style as above.

**Row structure**: Identical to "Link to" rows. The relation label reflects the linking module's declared `relation` value. The module name shown is the linking module's name (not the current module).

**Click behavior**: Navigate to where the linking module is visible (its parent level), select and centre the linking module's card.

---

## Show / Hide Animation

| State | Transform | Transition |
|-------|-----------|------------|
| Visible (selectedUuid non-null) | `translateX(0)` | `transform 200ms ease-out` |
| Hidden (selectedUuid null) | `translateX(100%)` | `transform 200ms ease-in` |

- The panel is mounted in the DOM at all times; visibility is controlled by the CSS transform, not by mounting/unmounting.
- `ease-out` on slide-in (decelerates into view — feels responsive).
- `ease-in` on slide-out (accelerates away — feels clean).
- No opacity fade — only transform.
- The panel must not clip its left border during the animation (use `overflow: hidden` on the panel container if needed to prevent edge artifact).

---

## Z-Index

- The panel sits above the React Flow canvas but below the topbar and command palette.
- It does not push or resize the canvas. Canvas remains full-width underneath.
- Suggested z-index: `z-index: 20` (above canvas at 0–10, below topbar at 40, below command palette at 50).

---

## Navigation Behaviour on Row Click

When the user clicks a submodule row or a link row (outgoing or incoming):

1. **Determine the target module UUID** from the row data.
2. **Find the target module's parent path** in the project index (walk the module tree to locate which level renders this UUID).
3. **Navigate the canvas** to the parent level: update `navStack` to end at the parent module's UUID.
4. **Wait for the canvas to re-render** at the new level (next animation frame or React commit).
5. **Set `selectedUuid`** to the target module's UUID.
6. **Centre the target's card** in the viewport using React Flow `fitView({ nodes: [targetId] })` or `setCenter` to the node's position.

**Shortcut**: If the target module is already visible at the current canvas level, skip steps 2–4 and go directly to step 5 (select) and step 6 (centre).

---

## Mobile Considerations (Not Required for Initial Implementation)

On viewports narrower than `640px`, the panel may be collapsed to an icon/tab and expanded on demand. This is explicitly deferred to a later iteration and should not block the initial implementation.
