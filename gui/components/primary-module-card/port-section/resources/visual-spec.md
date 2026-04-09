# Primary Module Card Port Section — Visual Specification

## Layout

```
├─────────────────────────────────────────────────┤  ← port divider: 1px dashed color/border/default
│◀  Submodule-A                                   │  ← target port row: ◀ icon + label, handle on left edge
│                          Submodule-B (out)    ▶│  ← source port row: label + ▶ icon, handle on right edge
│◀  Submodule-C              Submodule-C (out) ▶│  ← submodule with both incoming and outgoing links
│   +2 more ▾                                     │  ← collapsed overflow indicator (when > 6 rows)
└─────────────────────────────────────────────────┘
```

### Visual Token Table — Port Section

| Property | Token | Value |
|---|---|---|
| Section divider | 1px dashed `color/border/default` | `#C8C8D0` / `#3A3A42` |
| Port row height | `dimension/port-row-height` | 28px |
| Port row horizontal padding | `spacing/4` | 16px |
| Port row hover background | `color/interactive/hover` | rgba(0,0,0,0.04) / rgba(255,255,255,0.06) |
| Target port label color | `color/text/tertiary` | `#A0A0A8` / `#60606A` |
| Source port label color | `color/port/{n}` (round-robin palette) | see color palette below |
| Port label font | `typography/port-label` | 12px / 400 / 16px line-height |
| Port indicator icon (◀ ▶) | 10px, `color/text/tertiary` | `#A0A0A8` / `#60606A` |
| Port indicator inset from edge | `spacing/1` (4px) | inside card border |
| Handle size | `dimension/handle-size` | 8px diameter |
| Handle fill | `color/surface/default` | `#FFFFFF` / `#1C1C1F` |
| Handle stroke | 1.5px `color/border/default` | `#C8C8D0` / `#3A3A42` |

## Port Row Layout

### Target Port Row (incoming link)

```
├────────────────────────────────────────────────┤
│◀  Submodule-A                                  │
│   ^            ^                               │
│   handle(L)    label (color/text/tertiary)     │
│   ← 16px pad                                   │
```

- Handle ID: `port-{submoduleUuid}-in`
- Handle position: centered vertically on row, aligned to left edge of card
- Indicator `◀` is 4px inside the card's left border (purely decorative; handle is separate)

### Source Port Row (outgoing link)

```
├────────────────────────────────────────────────┤
│                       Submodule-B (out)     ▶│
│                       ^                    ^  │
│                       label (color/port/n) handle(R)
│                                 16px pad → │
```

- Handle ID: `port-{submoduleUuid}-out`
- Handle position: centered vertically on row, aligned to right edge of card
- Indicator `▶` is 4px inside the card's right border

### Dual Port Row (both incoming and outgoing)

```
├────────────────────────────────────────────────┤
│◀  Submodule-C              Submodule-C (out) ▶│
```

Same submodule name appears twice when the submodule has both incoming and outgoing external links. Target label (left) uses `color/text/tertiary`; source label (right) uses `color/port/{n}`.

## Port Color Palette

Source port labels are color-coded by external reference card assignment (round-robin):

| Token | Value | Token | Value |
|---|---|---|---|
| `color/port/0` | `#5B8DEE` | `color/port/4` | `#EF4444` |
| `color/port/1` | `#22C55E` | `color/port/5` | `#06B6D4` |
| `color/port/2` | `#A855F7` | `color/port/6` | `#F97316` |
| `color/port/3` | `#F59E0B` | `color/port/7` | `#EC4899` |

Color is assigned by the index of the external reference card on the canvas (0-indexed, wraps at 8).

## Overflow Behavior

If the port section would contain more than 6 rows:
- Show the first 5 rows normally.
- Show a `+N more ▾` collapsed indicator row at the bottom.
- Indicator font: `typography/ui-label` (13px), `color/text/accent`.
- Clicking the indicator expands all rows in-place (no animation required).

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Default` (with port section variant applied)
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
