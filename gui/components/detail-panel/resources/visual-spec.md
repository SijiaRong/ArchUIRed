# Detail Panel — Visual Specification

## Figma Reference

- **Component name**: `Panel/DetailPanel/Default`
- **Figma file key**: `beEbYQhz9LBLHrAj2eGyft`
- **Figma variable collections used**: `Color` (Light + Dark modes), `Spacing`, `Dimension`, `Typography`

---

## ASCII Layout Diagram

```
┌────────────────────────────────────┐  ← width: 320px  (dimension/detail-panel-width)
│  position: fixed, right: 0         │  ← anchored to right viewport edge
│  top: 48px  (dimension/topbar-height)  height: calc(100vh - 48px)
│  background: color/surface/raised  │  ← left border: 1px color/border/default
│  z-index: 20                       │  ← above canvas, below topbar
│  will-change: transform            │  ← GPU compositing hint
│                                    │
│  ←── spacing/5 (20px) ──→          │  ← horizontal padding (left + right)
│  pt: spacing/5 (20px)              │  ← top padding
│                                    │
│  Module Name                       │  ← 24px bold, color/port/N (sibling index 0–7)
│  a3f9c201                          │  ← 11px mono, color/text/primary @ opacity 0.45
│                                    │  ← gap: spacing/2 (8px)
│  Description of the module, wraps  │  ← 13px Regular, color/text/secondary
│  naturally to full width inside    │
│  the panel padding.                │
│                                    │
│  ────────────────────────────────  │  ← 1px color/border/default  mt: spacing/8 (32px)
│  SUBMODULES (3)                    │  ← 12px SemiBold UPPERCASE +0.4px, color/text/tertiary
│                                    │  ← gap: spacing/2 (8px) below heading
│  ›  Submodule Alpha                │  ← › color/text/tertiary; name 13px color/text/primary
│  ›  Submodule Beta                 │     min-height: 32px; hover: color/interactive/hover
│  ›  Submodule Gamma                │     cursor: pointer
│                                    │
│  ────────────────────────────────  │  ← 1px color/border/default  mt: spacing/8 (32px)
│  LINK TO (2)                       │  ← same header style
│                                    │  ← gap: spacing/2 (8px)
│  [depends-on]  Target Module       │  ← pill + 13px name color/text/primary
│  [references]  Another Module      │     hover: color/interactive/hover; cursor: pointer
│                Optional desc text  │  ← 11px color/text/secondary (only if link.description set)
│                                    │
│  ────────────────────────────────  │  ← 1px color/border/default  mt: spacing/8 (32px)
│  LINKED BY (1)                     │  ← same header style
│                                    │  ← gap: spacing/2 (8px)
│  [implements]  Source Module       │  ← same row structure as Link to
│                                    │
│  ←── spacing/5 (20px) ──→          │  ← horizontal padding
│  pb: spacing/8 (32px)              │  ← bottom padding
└────────────────────────────────────┘
```

---

## Animation States

```
Panel entering  (selectedUuid becomes non-null):
  from:  transform: translateX(100%)   ← fully off-screen to the right
  to:    transform: translateX(0)      ← in final position
  transition: transform 200ms ease-out

Panel leaving  (selectedUuid becomes null):
  from:  transform: translateX(0)
  to:    transform: translateX(100%)
  transition: transform 200ms ease-in
```

- The panel container is always mounted in the DOM. The CSS `transform` controls visibility; the component is never unmounted/remounted.
- `ease-out` on entry — decelerates into position; feels responsive and snappy.
- `ease-in` on exit — accelerates away; feels clean.
- No opacity fade — transform only.
- Apply `overflow: hidden` on the panel container to prevent any left-border artifact during the slide animation.
- `will-change: transform` enables GPU layer compositing for a smooth 60 fps animation.

---

## Color Token Assignments

### Panel Shell

| Element | Token | Light value | Dark value |
|---------|-------|-------------|------------|
| Panel background | `color/surface/raised` | `#FFFFFF` | `#26262B` |
| Left border | `color/border/default` | `#C8C8D0` | `#3A3A42` |
| Section separator line | `color/border/default` | `#C8C8D0` | `#3A3A42` |

### Header Section

| Element | Token | Note |
|---------|-------|------|
| Title text | `color/port/N` (index 0–7 round-robin) | Accent color from port palette, full opacity (1.0) |
| UUID text | `color/text/primary` at `opacity: 0.45` | Dimmed primary; monospace font override |
| Description text | `color/text/secondary` | Muted body copy |

### Section Headers (Submodules / Link to / Linked by)

| Element | Token | Light | Dark |
|---------|-------|-------|------|
| Header label text | `color/text/tertiary` | `#A0A0A8` | `#60606A` |

### Submodule Rows

| Element | Token | Note |
|---------|-------|------|
| Arrow indicator `›` | `color/text/tertiary` | Dimmed; fixed left column |
| Submodule name | `color/text/primary` | Full weight |
| Inline/tooltip description text | `color/text/secondary` | Secondary meta text on hover |
| Row hover background | `color/interactive/hover` | Full row width, overrides padding indent |

### Link Row Relation Pills

| Relation | Token | Light | Dark |
|----------|-------|-------|------|
| `depends-on` | `color/edge/depends-on` | `#2563EB` | `#5B8DEE` |
| `implements` | `color/edge/implements` | `#16A34A` | `#22C55E` |
| `extends` | `color/edge/extends` | `#9333EA` | `#A855F7` |
| `references` | `color/edge/references` | `#9098A1` | `#60606A` |
| `related-to` | `color/edge/related-to` | `#9098A1` | `#60606A` |
| custom | `color/edge/custom` | `#EA580C` | `#F97316` |

Pill background: the relation token color at 10–12% opacity. Pill border radius: `dimension/border-radius-small` (4px).

### Link Rows

| Element | Token | Note |
|---------|-------|------|
| Target/source module name | `color/text/primary` | Full weight |
| Fallback raw UUID (not found in project index) | `color/text/secondary`, monospace font | UUID truncated to 8 chars shown in place of name |
| Optional link description | `color/text/secondary` | `text-xs` below the target name |
| Row hover background | `color/interactive/hover` | Same as submodule rows |

---

## Typography Assignments

| Element | Token | Size | Weight | Line-height | Notes |
|---------|-------|------|--------|-------------|-------|
| Panel title | — | 24px | Bold (700) | 28px | No direct token — custom size for panel heading |
| UUID | `typography/ui-meta` | 11px | Regular (400) | 16px | Monospace font override: `'JetBrains Mono', 'Fira Code', monospace` |
| Description | `typography/ui-label` | 13px | Regular (400) | 18px | Full-width, natural wrapping |
| Section header | `typography/ui-heading` | 12px | Semi Bold (600) | 16px | UPPERCASE, letter-spacing +0.4px |
| Arrow indicator `›` | `typography/ui-label` | 13px | Regular (400) | 18px | Color: `color/text/tertiary` |
| Row name (submodule or module) | `typography/ui-label` | 13px | Regular (400) | 18px | Color: `color/text/primary` |
| Relation pill text | `typography/ui-meta` | 11px | Regular (400) | 16px | Letter-spacing +0.1px |
| Optional row description (inline) | `typography/ui-meta` | 11px | Regular (400) | 16px | Color: `color/text/secondary` |

---

## Spacing and Padding Values

| Location | Token | Value |
|----------|-------|-------|
| Panel horizontal padding (left + right) | `spacing/5` | 20px |
| Panel top padding | `spacing/5` | 20px |
| Panel bottom padding | `spacing/8` | 32px |
| Gap: title → UUID | `spacing/1` | 4px |
| Gap: UUID → description | `spacing/2` | 8px |
| Margin above each section separator | `spacing/8` | 32px |
| Gap: section header → first row | `spacing/2` | 8px |
| Row minimum height | — | 32px (auto-grows if content wraps) |
| Row vertical padding | `spacing/1` | 4px top + 4px bottom |
| Gap: arrow `›` → row name | `spacing/2` | 8px |
| Gap: row name → inline hover description | `spacing/1` | 4px |
| Relation pill: vertical padding | `spacing/1` | 4px top + 4px bottom |
| Relation pill: horizontal padding | `spacing/2` | 8px left + 8px right |
| Gap: relation pill → target name | `spacing/2` | 8px |

---

## Hover States

### Submodule Row Hover

```
Before hover:
  ›  Submodule Alpha

After hover (inline description variant):
  ›  Submodule Alpha
     Short description of the submodule.     ← color/text/secondary, 11px
  [row background: color/interactive/hover]
```

- Background fills the full row width including the left padding zone (negative horizontal margin on the row element, or use absolute positioning for the hover fill).
- Inline description appears below the name with `spacing/1` (4px) gap.
- Alternative: floating tooltip anchored to the right of the row or above it — implementation choice, but inline is the default reference design.

### Link Row Hover

```
Before hover:
  [depends-on]  Target Module

After hover:
  [depends-on]  Target Module
                Target module's description text.  ← color/text/secondary, 11px
  [row background: color/interactive/hover]
```

- The description shown on hover is the **target module's own `description`** from its README.md frontmatter — not the link entry's own `description` field.
- If the link entry also has a `description` field, that field is always shown (below the module name) regardless of hover state; the hover reveals the target's README description.

### Row Cursor

All interactive rows (submodule rows, link-to rows, linked-by rows): `cursor: pointer`.

---

## Empty States

Sections with no items are **hidden entirely**. No zero-count section header, no placeholder illustration, no "None" label.

| Condition | Rendered output |
|-----------|-----------------|
| No submodules | Submodules section not rendered |
| No outgoing links | Link to section not rendered |
| No incoming links | Linked by section not rendered |
| All three empty | Panel shows header only: title + UUID + description |

---

## Responsive Behavior

| Viewport width | Panel behavior |
|----------------|----------------|
| ≥ 640px | Standard 320px overlay panel, always overlaid on canvas |
| < 640px | Deferred — panel may become a collapsible tab/icon. Not implemented in v1. |
