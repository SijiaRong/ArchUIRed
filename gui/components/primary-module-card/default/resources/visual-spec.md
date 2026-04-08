# Primary Module Card Default — Visual Specification

## Primary Card

```
┌─────────────────────────────────────────────────┐
│  Module Name                                    │
│  a1b2c3d4                                       │
├─────────────────────────────────────────────────┤
│◀ One-sentence description from the         ▶│
│  README.md frontmatter.                         │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│ ◀ Sub-A                        Sub-B ▶│
└─────────────────────────────────────────────────┘
```

- **Background:** `surface/default` (white in light mode, dark-800 in dark mode)
- **Border:** 1px, `border/neutral`
- **Corner radius:** 12px
- **Shadow:** elevated (`0 2px 8px rgba(0,0,0,0.12)`) — distinguishes primary card as focal element
- **Title:** `text/primary`, 16px semi-bold
- **UUID:** `text/tertiary`, 11px mono, dimmed
- **Description:** `text/secondary`, 13px regular
- **Module-level handles (◀/▶):** on description section edges, shown only when module-level links exist

## External Reference Card

```
┌────────────────────┐
│  Module Name       │
│  e5f6a7b8          │
└────────────────────┘
```

- **Background:** `surface/default`
- **Border:** 1px, `border/subtle`
- **Corner radius:** 8px
- **Shadow:** none (flat)
- **Name:** `text/primary`, 13px semi-bold
- **UUID:** `text/tertiary`, 10px mono, more dimmed than primary card UUID

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Default` (primary card variant), `Node/ExternalCard/Default` (external card variant)
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
