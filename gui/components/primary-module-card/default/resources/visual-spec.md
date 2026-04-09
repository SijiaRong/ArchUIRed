# Primary Module Card Default — Visual Specification

## Primary Card

```
┌─────────────────────────────────────────────────┐
│  ●  Module Name                            [↗]  │  ← header (36px)
│     a1b2c3d4-e5f6-...                           │  ← uuid (dimmed)
├─────────────────────────────────────────────────┤
│◀                                             ▶│
│   One-sentence description from the             │  ← description body (52px)
│   SPEC.md / README.md frontmatter.              │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  ← port divider (1px dashed)
│◀ Submodule-A                                    │  ← target port row (28px)
│                          Submodule-B (out)    ▶│  ← source port row (28px)
└─────────────────────────────────────────────────┘
```

### Visual Token Table — Primary Card

| Property | Token | Resolved value (light / dark) |
|---|---|---|
| Background | `color/surface/default` | `#FFFFFF` / `#1C1C1F` |
| Border | 1px solid `color/border/subtle` | `#E4E4E8` / `#2C2C33` |
| Corner radius | `dimension/border-radius-card` | 8px |
| Shadow | `elevation/card/default` | 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06) |
| Card width | `dimension/node-width` | 240px |
| Header height | `dimension/node-header-height` | 36px |
| Header background | `color/surface/default` | (same as card) |
| Header padding | `spacing/4` horizontal, `spacing/2` vertical | 16px / 8px |
| Status dot | `color/status/clean` | `#9098A1` |
| Title font | `typography/node-name` | 14px / 600 / 20px line-height |
| Title color | `color/text/primary` | `#0F0F10` / `#F2F2F3` |
| UUID font | `typography/ui-meta` | 11px / 400 / 16px line-height |
| UUID color | `color/text/tertiary` | `#A0A0A8` / `#60606A` |
| Description body height | `dimension/node-body-height` | 52px |
| Description font | `typography/node-description` | 13px / 400 / 18px line-height |
| Description color | `color/text/secondary` | `#6B6B72` / `#9898A1` |
| Description padding | `spacing/4` horizontal, `spacing/2` vertical | 16px / 8px |
| Port divider | 1px dashed `color/border/default` | `#C8C8D0` / `#3A3A42` |
| Port row height | `dimension/port-row-height` | 28px |
| Port label font | `typography/port-label` | 12px / 400 / 16px line-height |
| Port label color (target) | `color/text/tertiary` | `#A0A0A8` / `#60606A` |
| Port label color (source) | `color/port/{n}` | varies per assignment |
| Handle size | `dimension/handle-size` | 8px diameter |
| Handle fill | `color/surface/default` | `#FFFFFF` / `#1C1C1F` |
| Handle stroke | 1.5px `color/border/default` | `#C8C8D0` / `#3A3A42` |
| Drill-in icon [↗] | 16×16px, `color/text/tertiary` at rest | opacity 0.4 at rest, 1.0 on hover |

## External Reference Card

```
┌────────────────────────┐
│  Module Name           │  ← name (13px semi-bold)
│  e5f6a7b8              │  ← uuid (11px mono, tertiary)
└────────────────────────┘
○                           ← handle on left or right edge
```

### Visual Token Table — External Reference Card

| Property | Token | Resolved value (light / dark) |
|---|---|---|
| Background | `color/surface/default` | `#FFFFFF` / `#1C1C1F` |
| Border | 1px solid `color/border/subtle` | `#E4E4E8` / `#2C2C33` |
| Corner radius | `dimension/border-radius-card` | 8px |
| Shadow | none (flat) | — |
| Name font | `typography/node-name` | 14px / 600 / 20px line-height |
| Name color | `color/text/primary` | `#0F0F10` / `#F2F2F3` |
| UUID font | `typography/ui-meta` | 11px / 400 / 16px line-height |
| UUID color | `color/text/tertiary` | `#A0A0A8` / `#60606A` |
| Padding | `spacing/4` horizontal, `spacing/2` vertical | 16px / 8px |
| Handle size | `dimension/handle-size` | 8px diameter |
| Handle fill | `color/surface/default` | (same as card) |
| Handle stroke | 1.5px `color/border/default` | `#C8C8D0` / `#3A3A42` |

## Hover State (Primary Card)

- Background overlay: `color/interactive/hover` applied over `color/surface/default`
- Border: unchanged
- Shadow: unchanged (elevation remains at `elevation/card/default`)
- Drill-in icon [↗]: opacity increases from 0.4 to 1.0
- Description body: `max-height` transitions from `0` to natural height (via title-reveal animation)
- Title font-size: transitions from 22px (resting expanded) to 14px (`typography/node-name`)

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Default` (primary card), `Node/ExternalCard/Default` (external card)
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
