# Typography Token Reference

**Base font family:** Inter (all weights). Fallback stack: `system-ui, -apple-system, sans-serif`.

## Text Style Tokens

| Token | Size | Weight | Line-height | Letter-spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `typography/node-name` | 14px | Semi Bold (600) | 20px | 0 | Module name in node header |
| `typography/node-description` | 13px | Regular (400) | 18px | 0 | Description text in node body |
| `typography/port-label` | 12px | Regular (400) | 16px | 0 | Port row labels in node port section |
| `typography/edge-label` | 11px | Medium (500) | 14px | +0.2px | Relation type label on link edges |
| `typography/breadcrumb` | 13px | Medium (500) | 18px | 0 | Breadcrumb crumb text |
| `typography/breadcrumb-current` | 13px | Semi Bold (600) | 18px | 0 | Current (last) breadcrumb crumb |
| `typography/ui-label` | 13px | Regular (400) | 18px | 0 | Panel field labels, button text |
| `typography/ui-meta` | 11px | Regular (400) | 16px | +0.1px | Timestamps, UUIDs, secondary meta |
| `typography/ui-heading` | 12px | Semi Bold (600) | 16px | +0.4px | Section headings in detail panel (uppercase) |

## Usage Notes

- **`ui-heading`** is always rendered UPPERCASE in the UI; letter-spacing compensates for optical spacing at uppercase.
- **`edge-label`** uses a positive letter-spacing to remain readable at small size on canvas.
- **`port-label`** matches `node-description` in line-height to allow predictable port row height calculations (port row = 28px = 16px line-height + 6px top + 6px bottom padding).

## Platform Mapping

| Platform | API | Example |
|----------|-----|---------|
| Web / Electron | CSS class or inline style | `font: 600 14px/20px 'Inter', sans-serif` |
| iOS | `Font` + `UIFont` | `Font.custom("Inter", size: 14).weight(.semibold)` |
| Android | `TextStyle` in Compose | `TextStyle(fontFamily = Inter, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, lineHeight = 20.sp)` |

## Figma Text Style Names

```
Node/Name             → typography/node-name
Node/Description      → typography/node-description
Node/PortLabel        → typography/port-label
Edge/Label            → typography/edge-label
Nav/Breadcrumb        → typography/breadcrumb
Nav/BreadcrumbCurrent → typography/breadcrumb-current
UI/Label              → typography/ui-label
UI/Meta               → typography/ui-meta
UI/Heading            → typography/ui-heading
```
