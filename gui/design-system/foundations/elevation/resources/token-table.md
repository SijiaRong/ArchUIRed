# Elevation Token Reference

## Depth Levels

| Level | Name | Where used |
|-------|------|-----------|
| 0 | flat | Canvas background elements, inline dividers |
| 1 | card | Module-node cards (default and selected states) |
| 2 | raised | Detail panel, command palette |
| 3 | floating | Tooltips, dropdown menus, context menus |

## Effect Token Definitions

### `elevation/card/default`

Resting shadow for module-node cards.

```
Drop shadow:
  x: 0    y: 1px   blur: 3px   spread: 0    color: rgba(0,0,0, 0.08)
  x: 0    y: 1px   blur: 2px   spread: 0    color: rgba(0,0,0, 0.06)
```

### `elevation/card/selected`

Selected-state shadow — adds a focus glow ring on top of the default shadow.

```
Drop shadow (same as default, preserved underneath):
  x: 0    y: 1px   blur: 3px   spread: 0    color: rgba(0,0,0, 0.08)

Focus ring:
  x: 0    y: 0     blur: 0     spread: 3px  color: rgba(37,99,235, 0.20)
  (Dark mode spread color: rgba(91,141,238, 0.25))
```

### `elevation/raised`

For panels and command palette. Stronger vertical shadow.

```
Drop shadow:
  x: 0    y: 4px   blur: 12px  spread: 0    color: rgba(0,0,0, 0.12)
  x: 0    y: 1px   blur: 3px   spread: 0    color: rgba(0,0,0, 0.08)
```

### `elevation/floating`

For tooltips and menus. Maximum shadow depth.

```
Drop shadow:
  x: 0    y: 8px   blur: 24px  spread: -2px  color: rgba(0,0,0, 0.16)
  x: 0    y: 2px   blur: 6px   spread: 0     color: rgba(0,0,0, 0.10)
```

## Dark Mode Adjustments

Shadow opacity is reduced by ~30% in Dark mode because dark surfaces already carry natural depth cues. The Figma effect styles encode the Dark mode values — do not reduce opacity manually in platform code.

## Figma Effect Style Names

```
Node/Default    → elevation/card/default
Node/Selected   → elevation/card/selected
Panel/Raised    → elevation/raised
Menu/Floating   → elevation/floating
```

## Platform API Mapping

| Platform | API |
|----------|-----|
| Web / Electron | `box-shadow` CSS property |
| iOS | `shadow(color:radius:x:y:)` modifier on SwiftUI views |
| Android | `Modifier.shadow(elevation, shape)` or custom `DrawScope` shadow |
