# Primary Module Card Selected — Visual Specification

## Primary Card — Selected

```
╔═════════════════════════════════════════════════╗  ← 2px border, color/border/focus
║  ●  Module Name                            [↗]  ║  ← [↗] always visible (not hover-only)
║     a1b2c3d4-e5f6-...                          ║
╠═════════════════════════════════════════════════╣
║◀                                             ▶║  ← module-level handles always visible
║   One-sentence description text.               ║  ← description expanded
╠ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ╣
║◀ Submodule-A               Submodule-B (out) ▶║  ← port handles always visible
╚═════════════════════════════════════════════════╝
         ↑ box-shadow: focus ring (3px spread, color/border/focus @ 20% opacity)
              + standard drop shadow (elevation/card/default)
```

### Visual Token Table — Primary Card (Selected)

| Property | Default value | Selected override | Token |
|---|---|---|---|
| Border width | 1px | **2px** | — |
| Border color | `color/border/subtle` | **`color/border/focus`** | `#2563EB` / `#5B8DEE` |
| Background | `color/surface/default` | **`color/interactive/selected-bg`** | `#EFF6FF` / `#1E2F4D` |
| Box-shadow | `elevation/card/default` | **`elevation/card/selected`** | focus ring 0 0 0 3px rgba(37,99,235,0.20) + drop shadow |
| Drill-in icon [↗] | opacity 0.4 (rest), 1.0 (hover) | **always opacity 1.0** | — |
| Module handles | conditional on hover | **always visible** | — |
| Port handles | conditional on hover | **always visible** | — |

All other visual properties (typography, spacing, handle geometry) are identical to the default state.

## External Reference Card — Selected

```
╔═════════════════════════════╗  ← 2px border, color/border/focus
║  Module Name                ║
║  e5f6a7b8                   ║
╚═════════════════════════════╝
         ↑ box-shadow: 0 0 0 3px rgba(37,99,235,0.20)
○           ← handle always visible
```

| Property | Default value | Selected override | Token |
|---|---|---|---|
| Border width | 1px | **2px** | — |
| Border color | `color/border/subtle` | **`color/border/focus`** | `#2563EB` / `#5B8DEE` |
| Background | `color/surface/default` | **`color/interactive/selected-bg`** | `#EFF6FF` / `#1E2F4D` |
| Box-shadow | none | **0 0 0 3px rgba(37,99,235,0.20)** | `elevation/card/selected` (ring only) |
| Handle | conditional on hover | **always visible** | — |

## Detail Panel Side Effect

When a card enters the selected state the detail panel opens:

- **Transition:** `translateX(100%) → translateX(0)`, 180ms `ease-out`
- **Width (desktop):** `dimension/detail-panel-width` = 320px
- **Width (mobile, < 768px):** full-width bottom drawer

## Mutual Exclusivity

At most one card is selected at a time. Single-clicking a different card immediately transitions the previously-selected card back to its prior state (default, modified, or error).

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Selected`, `Node/ExternalCard/Selected`
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
