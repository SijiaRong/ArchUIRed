# Breadcrumb — Visual Specification

## Breadcrumb Bar Anatomy

The breadcrumb bar sits inside the 48px topbar, vertically centred. It spans the full available width of the topbar (minus horizontal padding).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  topbar  (48px)                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  breadcrumb bar  (32px, full width, vertically centred in topbar)     │  │
│  │                                                                       │  │
│  │   ArchUI   ›   GUI   ›   Canvas   ›   Module Node                    │  │
│  │    root       mid-1      mid-2       current (rightmost)             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Bar dimensions:**

| Property        | Value                     | Token                          |
|-----------------|---------------------------|--------------------------------|
| height          | 32px                      | —                              |
| padding         | 0 16px                    | `spacing/400` (16px)           |
| background      | inherits topbar surface   | `color/surface/topbar`         |
| border-bottom   | 1px solid                 | `color/border/subtle`          |

---

## Crumb Item Anatomy

Each crumb is a text label followed by a separator, except the last (current) crumb which has no trailing separator.

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
  │  ArchUI      │  ›  │  GUI         │  ›  │  Module Node     │
  │  (root)      │     │  (mid-crumb) │     │  (current)       │
  └──────────────┘     └──────────────┘     └──────────────────┘

  clickable            clickable             non-clickable
  text/link color      text/link color       text/primary color
  underline on hover   underline on hover    font-weight 500
  cursor: pointer      cursor: pointer       cursor: default
```

**Typography:**

| Property     | Value  | Token                       |
|--------------|--------|-----------------------------|
| font-size    | 13px   | `typography/size/sm`        |
| font-weight  | 400    | `typography/weight/regular` |
| line-height  | 32px   | (full bar height)           |

**Separator `›`:**

| Property       | Value  | Token                  |
|----------------|--------|------------------------|
| color          | dimmed | `color/text/tertiary`  |
| horizontal gap | 8px    | `spacing/200` (8px)    |
| interaction    | none   | non-clickable          |

---

## Crumb States

### Root crumb

```
  [ ArchUI ]
```

- Always present; never hidden even during overflow.
- Color: `color/text/link`
- Hover: underline, background `color/surface/hover`
- Active (pressing): `color/text/link-pressed`

### Intermediate (mid) crumb — default

```
  [ GUI ]
```

- Color: `color/text/link`
- Hover: underline, cursor pointer
- Focus ring: `color/border/focus`, 2px offset (keyboard nav)

### Intermediate (mid) crumb — hover

```
  [ GUI ]  ← underline visible, background tint
           token: color/surface/hover
```

### Current (active) crumb

```
  [ Module Node ]
```

- Color: `color/text/primary`
- Font-weight: 500 (`typography/weight/medium`)
- No underline, no hover state, cursor default
- Not keyboard-focusable (not interactive)

---

## Overflow Truncation Behavior

When the total crumb width exceeds the available bar width:

1. Root crumb (leftmost) always stays visible.
2. Current crumb (rightmost) always stays visible.
3. All intermediate crumbs between root and current collapse into a single `…` overflow button.
4. Clicking `…` opens a dropdown listing the hidden crumbs in order (top = closest to root).

```
Before overflow:
  ArchUI  ›  GUI  ›  Screens  ›  Canvas  ›  Module Node

After overflow (Screens and Canvas hidden):
  ArchUI  ›  …  ›  Module Node
              ↓ (click)
         ┌──────────────┐
         │  GUI         │
         │  Screens     │
         │  Canvas      │
         └──────────────┘
```

**Overflow `…` button:**

| Property     | Value                      |
|--------------|----------------------------|
| color        | `color/text/link`          |
| hover        | underline, surface/hover   |
| dropdown bg  | `color/surface/overlay`    |
| dropdown border | 1px `color/border/subtle` |
| dropdown shadow | `elevation/dropdown`    |

---

## Token Reference Summary

| Element             | Property         | Token                         |
|---------------------|------------------|-------------------------------|
| Bar background      | background       | `color/surface/topbar`        |
| Bar bottom edge     | border-bottom    | `color/border/subtle`         |
| Root crumb          | color            | `color/text/link`             |
| Mid-crumb default   | color            | `color/text/link`             |
| Mid-crumb hover     | background       | `color/surface/hover`         |
| Current crumb       | color            | `color/text/primary`          |
| Current crumb       | font-weight      | `typography/weight/medium`    |
| Separator `›`       | color            | `color/text/tertiary`         |
| Focus ring          | border-color     | `color/border/focus`          |
| Overflow dropdown   | background       | `color/surface/overlay`       |
| Overflow dropdown   | border           | `color/border/subtle`         |
| Overflow dropdown   | shadow           | `elevation/dropdown`          |

---

## Figma Node

- **Component:** `Nav/Breadcrumb/Default`
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
