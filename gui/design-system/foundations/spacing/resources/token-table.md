# Spacing & Dimension Token Reference

## Spacing Scale — `spacing/*`

Base unit: **4px**. Scale doubles at each major step.

| Token | Value | Common usage |
|-------|-------|-------------|
| `spacing/1` | 4px | Icon-to-text gap, tight insets |
| `spacing/2` | 8px | Internal component padding (compact) |
| `spacing/3` | 12px | Node header vertical padding |
| `spacing/4` | 16px | Node card horizontal padding, panel section gap |
| `spacing/5` | 20px | Panel content horizontal margin |
| `spacing/6` | 24px | Between-node default grid spacing |
| `spacing/8` | 32px | Section separation in detail panel |
| `spacing/10` | 40px | External stub edge length |
| `spacing/12` | 48px | Large UI gaps |

## Dimension Tokens — `dimension/*`

Fixed values that define component geometry. Used directly in layout calculations.

| Token | Value | Usage |
|-------|-------|-------|
| `dimension/node-width` | 240px | Fixed width of every module-node card |
| `dimension/node-header-height` | 36px | Height of the node header row |
| `dimension/node-body-height` | 52px | Height of the node body (description) row |
| `dimension/node-divider-height` | 1px | Port section divider line |
| `dimension/port-row-height` | 28px | Height of each port row in the port section |
| `dimension/detail-panel-width` | 320px | Width of the right-side detail panel |
| `dimension/topbar-height` | 48px | Height of the topbar |
| `dimension/border-radius-card` | 8px | Corner radius of node cards |
| `dimension/border-radius-small` | 4px | Corner radius of badges and chips |
| `dimension/handle-size` | 8px | Diameter of React Flow connection handles |

## Port Handle Y Formula

The Y offset of port handle `i` (0-indexed) from the top of a node card:

```
handle_y = node-header-height + node-body-height + node-divider-height
           + i × port-row-height + port-row-height / 2
         = 36 + 52 + 1 + i × 28 + 14
         = 103 + i × 28   (px from top of card)
```

This formula must be reproduced identically on all canvas platforms to align edge endpoints with port handle positions.

## Figma Variable Collections

| Token group | Figma collection | Mode |
|-------------|-----------------|------|
| `spacing/*` | `Spacing` | Default |
| `dimension/*` | `Dimension` | Default |
