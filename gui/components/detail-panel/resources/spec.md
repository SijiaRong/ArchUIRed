# Detail Panel — Component Specification

## Overview

The Detail Panel is a fixed-width overlay panel anchored to the right edge of the canvas viewport. It slides in from the right when a module is selected and slides out when the selection is cleared. It provides a structured, navigable view of the selected module's metadata and relationships without leaving the canvas.

---

## Panel Dimensions and Positioning

| Property | Value | Token |
|----------|-------|-------|
| Width | 320px | `dimension/detail-panel-width` |
| Height | `calc(100vh - 48px)` | 100% viewport minus topbar |
| Position | `position: fixed`, `right: 0`, `top: 48px` | Anchored to right edge, below topbar |
| Z-index | 20 | Above canvas (0–10), below topbar (40), below command palette (50) |
| Layout behavior | Overlay — the canvas layout is unaffected by panel open/close | — |
| Overflow | `overflow-y: auto`, `overflow-x: hidden` | Scrollable vertically when content exceeds height |

The panel does not push the canvas. The React Flow canvas remains full-width at all times underneath the panel. Only the transform position changes.

---

## Background, Border, and Padding

| Property | Token | Light | Dark |
|----------|-------|-------|------|
| Background | `color/surface/raised` | `#FFFFFF` | `#26262B` |
| Left border | `color/border/default` | `#C8C8D0` | `#3A3A42` |
| Border width | — | 1px | 1px |
| Horizontal padding (left + right) | `spacing/5` | 20px | 20px |
| Top padding | `spacing/5` | 20px | 20px |
| Bottom padding | `spacing/8` | 32px | 32px |

---

## Show / Hide Behavior

### Trigger Conditions

- **Panel appears**: when `selectedUuid` transitions from `null` to a non-null UUID value.
- **Panel disappears**: when `selectedUuid` transitions from a non-null UUID to `null`.
- **Panel content updates**: when `selectedUuid` transitions from one non-null UUID to a different non-null UUID (the panel stays visible; content re-renders for the new module).

### Animation

| Direction | Transform | Transition |
|-----------|-----------|------------|
| Slide in (enter) | `translateX(100%)` → `translateX(0)` | `transform 200ms ease-out` |
| Slide out (exit) | `translateX(0)` → `translateX(100%)` | `transform 200ms ease-in` |

- The panel is always mounted in the DOM — visibility is controlled entirely by the CSS transform.
- `ease-out` on entry: decelerates to a stop, feels snappy and responsive.
- `ease-in` on exit: accelerates away, feels clean.
- No opacity fade — transform only.
- Apply `overflow: hidden` on the panel's outer wrapper to prevent left-border rendering artifacts during the translation.
- Apply `will-change: transform` to promote the panel to its own GPU compositing layer.

### Canvas Interaction

- The panel overlaps the canvas from the right at z-index 20.
- It does not push, resize, or clip the React Flow canvas.
- Clicking on the canvas (outside the panel) while the panel is open will trigger `onPaneClick` → `selectModule(null)` → panel slides out.
- Clicking inside the panel does not propagate to the canvas (the panel element stops pointer events from reaching the pane).

---

## Section-by-Section Layout

### Header Section

The header is always present when the panel is open. It is not collapsible.

#### Title

- **Content**: The module's `name` from its `README.md` (or typed identity document) frontmatter.
- **Font**: 24px, bold (weight 700), line-height 28px. Inter font family.
- **Color**: The deterministic accent color for this module's primary card — `color/port/N` where N is the module's sibling index (0–7, round-robin). This is the same color formula used by `ModuleNode`'s `colorIndex` prop.
- **Opacity**: Full (1.0). The title is never dimmed.
- **Margin below**: `spacing/1` (4px) gap to the UUID line.

#### UUID

- **Content**: First 8 hex characters of the module's full UUID.
- **Font**: `typography/ui-meta` — 11px, Regular (400), line-height 16px, letter-spacing +0.1px.
- **Font family**: Monospace — `'JetBrains Mono', 'Fira Code', monospace`.
- **Color**: `color/text/primary` at `opacity: 0.45`.
- **Margin below**: `spacing/2` (8px) gap to the description.

#### Description

- **Content**: The `description` field from the module's `README.md` frontmatter.
- **Font**: `typography/ui-label` — 13px, Regular (400), line-height 18px.
- **Color**: `color/text/secondary`.
- **Wrapping**: Text wraps to the full panel content width (panel width minus horizontal padding = 280px).
- **Margin top**: `spacing/2` (8px) from UUID line (shared with UUID margin-below).

---

### Submodules Section

**Visibility**: Rendered only when the module's `.archui/index.yaml` `submodules` map is non-empty (count ≥ 1). When empty: the entire section — separator, header, and rows — is not rendered. No placeholder text or empty-state label.

**Section separator**: A horizontal rule, 1px height, `color/border/default`, with `margin-top: spacing/8` (32px) from the content above it.

**Section header**: `"SUBMODULES (N)"` where N is the count of entries in the `submodules` map.
- `typography/ui-heading`: 12px, Semi Bold (600), line-height 16px, letter-spacing +0.4px, all-caps.
- Color: `color/text/tertiary`.
- `margin-bottom: spacing/2` (8px) before the first row.

**Row structure** (one row per submodule entry):

```
[›]  [Submodule Name]
     [Description text]   ← only visible on hover
```

| Element | Detail |
|---------|--------|
| Arrow `›` | `color/text/tertiary`; `typography/ui-label` (13px); fixed 16px left column; aligned to first line of name |
| Submodule name | `typography/ui-label` (13px), `color/text/primary` |
| Row minimum height | 32px; expands if the name wraps to multiple lines |
| Row vertical padding | `spacing/1` (4px) top + `spacing/1` (4px) bottom |
| Gap: `›` → name | `spacing/2` (8px) |
| Cursor | `pointer` |

**Hover behavior**: On row hover, apply `color/interactive/hover` as the row background fill (full row width, including the left padding zone). Reveal the submodule's `description` text below the name:
- `typography/ui-meta` (11px), `color/text/secondary`.
- `margin-top: spacing/1` (4px) from the name.

**Click behavior**: See "Navigation Behaviour on Row Click" section.

---

### Link to Section

**Visibility**: Rendered only when the module has at least one outgoing link entry in its `.archui/index.yaml` `links` array. When empty: entire section is not rendered.

**Section separator**: Same style as Submodules. `margin-top: spacing/8` (32px).

**Section header**: `"LINK TO (N)"` where N is the count of outgoing link entries.
- Same typography and color as Submodules header.

**Row structure** (one row per outgoing link):

```
[relation-pill]  [Target Module Name]
                 [Optional link description]   ← only if link.description is set
```

| Element | Detail |
|---------|--------|
| Relation pill | `typography/ui-meta` (11px), colored per `color/edge/<relation>` (full opacity text, ~10% opacity background tint). Border radius: `dimension/border-radius-small` (4px). Padding: `spacing/1` vertical, `spacing/2` horizontal. |
| Gap: pill → name | `spacing/2` (8px) |
| Target module name | `typography/ui-label` (13px), `color/text/primary`. If the target UUID is not found in the project index, render the raw 8-char UUID in monospace using `color/text/secondary`. |
| Optional link description | Only rendered when the link entry in `.archui/index.yaml` has a non-empty `description` field. `typography/ui-meta` (11px), `color/text/secondary`. `margin-top: spacing/1` (4px) below the target name. Indented to align with the target name (not the pill). |
| Row minimum height | 32px; expands if optional description is present |
| Cursor | `pointer` |

**Hover behavior**: On row hover, apply `color/interactive/hover` background. Reveal the **target module's own `description`** (from its `README.md` frontmatter) as inline secondary text below the name:
- `typography/ui-meta` (11px), `color/text/secondary`.
- This is distinct from the link entry's own `description` field (which, if set, is always visible).

**Click behavior**: See "Navigation Behaviour on Row Click" section.

---

### Linked by Section

**Visibility**: Rendered only when at least one other module in the project declares a link pointing to this module's UUID (i.e., this module appears as a link target in another module's `.archui/index.yaml`). When empty: entire section is not rendered.

**Section separator**: Same style. `margin-top: spacing/8` (32px).

**Section header**: `"LINKED BY (N)"` where N is the count of modules linking to this module.
- Same typography and color as other section headers.

**Row structure**: Identical to "Link to" rows, with the following mapping:
- The **module name** shown is the linking module's name (the module that declares the link), not the current module.
- The **relation label** is the `relation` value declared in the linking module's link entry (reflecting the linking module's perspective).
- The **optional description** is the linking module's link entry `description` field (if set).

**Hover behavior**: Reveal the linking module's own `description` from its `README.md`.

**Click behavior**: Navigate to where the linking module is visible (its parent level), then select and centre the linking module's card. See "Navigation Behaviour on Row Click" section.

---

## Navigation Behaviour on Row Click

When the user clicks a submodule row, a Link to row, or a Linked by row, the following 6-step algorithm executes:

1. **Determine the target module UUID** from the row's data binding.
2. **Find the target module's parent path** in the project index: walk the module tree (via `.archui/index.yaml` `submodules` maps at each level) to determine the parent module whose submodules map contains the target UUID. This determines which canvas level renders the target.
3. **Navigate the canvas** to the parent level: update `navStack` to end at the parent module's UUID. This triggers a canvas re-render at the new level.
4. **Wait for the canvas to re-render** at the new level (next animation frame, or React's `useEffect` after state commit).
5. **Set `selectedUuid`** to the target module's UUID via `selectModule(targetUuid)`.
6. **Centre the target's card** in the viewport using `fitView({ nodes: [targetId], padding: 0.25 })` or `setCenter` to the node's computed position.

**Shortcut**: If the target module is already visible at the current canvas level (it appears in the current canvas's node list), skip steps 2–4 and execute steps 5–6 directly.

**Root-level modules**: If the target's parent is the root canvas level, set `navStack` to `[]` (empty, representing the root) rather than to a specific UUID.

---

## Empty Panel State

When `selectedUuid` is non-null but the project index cannot find the module data (e.g., the module was just deleted):
- Show the header section with the UUID displayed as the title (8-char mono, fallback).
- Omit description, submodules, link-to, and linked-by sections.
- This is an edge case; normal usage will always have valid module data.

---

## Mobile Considerations (Deferred — Not Required for Initial Implementation)

On viewports narrower than 640px, the panel may be collapsed to an icon or tab and expanded on demand. This is explicitly deferred and must not block the initial implementation.
