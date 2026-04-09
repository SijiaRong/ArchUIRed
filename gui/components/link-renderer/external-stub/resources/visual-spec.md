# External Reference Card — Visual Specification

> The external-stub module is deprecated. External stubs have been replaced by external reference cards. This visual spec describes the external reference card that appears on the canvas for every cross-boundary link.

## Card Anatomy

```
┌────────────────────┐
│  Module Name       │  ← text/primary, 13px semi-bold
│  e5f6a7b8          │  ← text/tertiary, 10px mono (dimmed UUID)
└────────────────────┘
```

- Width: auto-fit to longest content, minimum 120px, maximum 240px.
- Height: auto (two lines of content + vertical padding).

## Dimensions and Spacing

```
┌──────────────────────────────┐  ← border: 1px color/border/subtle
│                              │  ← corner radius: 8px
│  ← 12px →  Module Name      │  ← text/primary 13px semi-bold
│  ← 12px →  e5f6a7b8         │  ← text/tertiary 10px mono
│                              │
└──────────────────────────────┘
     ↕ 8px top + bottom padding
```

| Property | Value | Token |
|----------|-------|-------|
| Background | White / dark-800 | `surface/default` |
| Border | 1px solid | `color/border/subtle` |
| Corner radius | 8px | — |
| Shadow | None | — (flat, no elevation) |
| Horizontal padding | 12px | `spacing/3` |
| Vertical padding | 8px | `spacing/2` |
| Name font | 13px semi-bold | `typography/label/md` |
| UUID font | 10px mono | `typography/mono/sm` |
| Name color | — | `text/primary` |
| UUID color | — | `text/tertiary` |

## Connection Anchors

```
       Left anchor                  Right anchor
            ●                            ●
┌───────────●────────────────────────────●───┐
│  Module Name                               │
│  e5f6a7b8                                  │
└────────────────────────────────────────────┘
```

- Left anchor (◀): vertically centered on the card left edge. Receives incoming edges from outgoing links on the primary canvas.
- Right anchor (▶): vertically centered on the card right edge. Sources incoming edges arriving at the primary canvas.
- Anchors are not rendered as visible handles — they are invisible hit points used by the edge renderer.

## States

### Default (unselected)

```
┌────────────────────┐
│  Module Name       │  background: surface/default
│  e5f6a7b8          │  border: color/border/subtle
└────────────────────┘
```

### Selected (single click)

```
┌────────────────────┐
│  Module Name       │  border: 1.5px color/accent/primary
│  e5f6a7b8          │  background: surface/default
└────────────────────┘
```

Connected edges highlight to `color/accent/primary`.

### Hover

```
┌────────────────────┐
│  Module Name       │  background: surface/subtle
│  e5f6a7b8          │  cursor: pointer
└────────────────────┘
```

### Dragging

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  Module Name           background: surface/default
  e5f6a7b8             opacity: 0.85, shadow: elevation/drag
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

The card is rendered at reduced opacity with an elevated shadow while being dragged. Connected edges follow in real time.

## Contrast with Primary Card

| Property | Primary Card | External Reference Card |
|----------|-------------|------------------------|
| Corner radius | 12px | 8px |
| Shadow | `elevation/card` | None (flat) |
| Name font size | 16px | 13px |
| UUID font size | 11px | 10px |
| Port section | Yes | No |
| Width | Fixed (wider) | Auto-fit |

This contrast signals to the user that the primary card is the focal module and external cards are peripheral references.

## Figma Node

- **Component:** `Node/ExternalCard/Default`
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
