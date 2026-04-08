# Primary Module Card Selected — Visual Specification

## Primary Card

```
┌═════════════════════════════════════════════════┐  ← 2px border, accent/primary
│  Module Name                                    │
│  a1b2c3d4                                       │
├─────────────────────────────────────────────────┤
│◀ Description text                          ▶│
└═════════════════════════════════════════════════┘
         ↑ box-shadow: 0 0 0 3px accent/primary @20% opacity
```

## External Reference Card

```
┌═══════════════════════┐  ← 2px border, accent/primary
│  Module Name          │
│  e5f6a7b8             │
└═══════════════════════┘
         ↑ box-shadow: 0 0 0 3px accent/primary @20% opacity
```

- **Border:** 2px, `accent/primary` (blue) — both card types
- **Shadow:** `0 0 0 3px` `accent/primary` at 20% opacity (glow ring) — both card types
- **Background:** unchanged from Default for each card type
- **Drill-in icon [↗]:** always visible (not hover-only) on primary card in Selected state

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Selected`, `Node/ExternalCard/Selected`
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
