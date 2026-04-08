# Detail Panel — Visual Specification

## Figma Reference

- **Component name**: `Panel/DetailPanel/Default`
- **Figma file key**: `beEbYQhz9LBLHrAj2eGyft`
- **Figma variable collections used**: `Color` (Light + Dark modes), `Spacing`, `Dimension`, `Typography`

---

## ASCII Layout Diagram

```
┌────────────────────────────────────┐  ← width: 320px (dimension/detail-panel-width)
│  left border: 1px color/border/default
│  background: color/surface/raised
│                                    │
│  ← spacing/5 (20px) padding →      │
│                                    │
│  Module Name                       │  ← 24px bold, color/port/N (accent)
│  a3f9c201                          │  ← 11px mono, opacity 0.45
│                                    │  ← spacing/2 (8px) gap
│  Description of the module here,   │  ← 13px Regular, color/text/secondary
│  wraps naturally to full width.    │
│                                    │
│  ─── ─── ─── ─── ─── ─── ─── ──  │  ← 1px color/border/default, mt: spacing/8
│  SUBMODULES (3)                    │  ← 12px SemiBold uppercase, color/text/tertiary
│                                    │  ← spacing/2 (8px) below heading
│  ›  Submodule Alpha                │  ← › dimmed, name: 13px color/text/primary
│  ›  Submodule Beta                 │
│  ›  Submodule Gamma                │
│                                    │
│  ─── ─── ─── ─── ─── ─── ─── ──  │  ← separator, mt: spacing/8
│  LINK TO (2)                       │  ← section header
│                                    │
│  [depends-on]  Target Module       │  ← pill + 13px name
│  [references]  Another Module      │
│                Optional desc text  │  ← 11px color/text/secondary (if present)
│                                    │
│  ─── ─── ─── ─── ─── ─── ─── ──  │  ← separator, mt: spacing/8
│  LINKED BY (1)                     │  ← section header
│                                    │
│  [implements]  Source Module       │  ← same row structure as Link to
│                                    │
│  ← spacing/5 (20px) padding →      │
│  pb: spacing/8 (32px)              │
└────────────────────────────────────┘
```

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
| Title text | `color/port/N` (index 0–7) | Accent color from port palette, full opacity |
| UUID text | `color/text/primary` at opacity 0.45 | Dimmed primary |
| Description text | `color/text/secondary` | Muted body |

### Section Headers (Submodules / Link to / Linked by)

| Element | Token | Light | Dark |
|---------|-------|-------|------|
| Header label | `color/text/tertiary` | `#A0A0A8` | `#60606A` |

### Submodule Rows

| Element | Token | Note |
|---------|-------|------|
| Arrow `›` | `color/text/tertiary` | Dimmed indicator |
| Submodule name | `color/text/primary` | Full weight |
| Tooltip/inline description | `color/text/secondary` | Secondary meta |
| Hover row background | `color/interactive/hover` | `rgba(0,0,0,0.04)` light / `rgba(255,255,255,0.06)` dark |

### Link Row Relation Pills

| Relation | Border/text color token | Light | Dark |
|----------|------------------------|-------|------|
| `depends-on` | `color/edge/depends-on` | `#2563EB` | `#5B8DEE` |
| `implements` | `color/edge/implements` | `#16A34A` | `#22C55E` |
| `extends` | `color/edge/extends` | `#9333EA` | `#A855F7` |
| `references` | `color/edge/references` | `#9098A1` | `#60606A` |
| `related-to` | `color/edge/related-to` | `#9098A1` | `#60606A` |
| custom | `color/edge/custom` | `#EA580C` | `#F97316` |

Pill background: the relation edge color at 10–12% opacity. Border radius: `dimension/border-radius-small` (4px).

### Link Rows

| Element | Token | Note |
|---------|-------|------|
| Target module name | `color/text/primary` | Full weight |
| Fallback UUID (not found) | `color/text/secondary`, mono font | Shown when UUID not in project index |
| Optional link description | `color/text/secondary` | `text-xs` below name |
| Hover row background | `color/interactive/hover` | Same as submodule rows |

---

## Typography Assignments

| Element | Token | Size | Weight | Line-height | Notes |
|---------|-------|------|--------|-------------|-------|
| Panel title | — | 24px | Bold (700) | 28px | No direct token — custom size for panel heading |
| UUID | `typography/ui-meta` | 11px | Regular (400) | 16px | Mono font override |
| Description | `typography/ui-label` | 13px | Regular (400) | 18px | — |
| Section header | `typography/ui-heading` | 12px | Semi Bold (600) | 16px | UPPERCASE, +0.4px letter-spacing |
| Arrow indicator `›` | `typography/ui-label` | 13px | Regular (400) | 18px | Dimmed |
| Row name (submodule or module) | `typography/ui-label` | 13px | Regular (400) | 18px | — |
| Relation pill text | `typography/ui-meta` | 11px | Regular (400) | 16px | +0.1px letter-spacing |
| Optional row description | `typography/ui-meta` | 11px | Regular (400) | 16px | — |

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
| Row minimum height | — | 32px |
| Row vertical padding | `spacing/1` | 4px top + 4px bottom |
| Gap: arrow `›` → row name | `spacing/2` | 8px |
| Gap: row name → optional description | `spacing/1` | 4px |
| Relation pill horizontal padding | `spacing/1` / `spacing/2` | 4px top/bottom, 8px left/right |
| Gap: relation pill → target name | `spacing/2` | 8px |

---

## Hover States

### Submodule Row Hover

```
Before hover:
  ›  Submodule Alpha

After hover (inline description variant):
  ›  Submodule Alpha
     Short description of the submodule.
  [row background: color/interactive/hover]
```

- Background fills the full row width (ignoring left padding indent).
- Inline description appears below the name with `spacing/1` (4px) gap.
- Alternatively, a tooltip may float above/beside the row — implementation choice.

### Link Row Hover

```
Before hover:
  [depends-on]  Target Module

After hover:
  [depends-on]  Target Module
                Target module's description text.
  [row background: color/interactive/hover]
```

- The description shown on hover is the target module's `description` from its `README.md` frontmatter (not the link's own description field).

### Row Cursor

- All interactive rows: `cursor: pointer`.

---

## Empty States

Sections with no items are **hidden entirely**. There is no "no items" placeholder text, empty state illustration, or zero-count header.

| Condition | Behavior |
|-----------|----------|
| No submodules | Submodules section not rendered |
| No outgoing links | Link to section not rendered |
| No incoming links | Linked by section not rendered |
| All three empty | Panel header only (title + UUID + description) |

---

## Animation States

```
Panel entering (selectedUuid becomes non-null):
  from: transform: translateX(100%)   ← off-screen right
  to:   transform: translateX(0)      ← in position
  transition: transform 200ms ease-out

Panel leaving (selectedUuid becomes null):
  from: transform: translateX(0)
  to:   transform: translateX(100%)
  transition: transform 200ms ease-in
```

The panel container is always mounted in the DOM. The transform controls visibility. `will-change: transform` may be applied for GPU compositing.

---

## Responsive Behavior

| Viewport width | Panel behavior |
|----------------|----------------|
| ≥ 640px | Standard 320px panel, always overlaid |
| < 640px | Deferred — panel may become a tab/icon (not implemented in v1) |
