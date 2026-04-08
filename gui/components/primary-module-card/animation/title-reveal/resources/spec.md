# Title Reveal — Interaction Spec

## States

| State | Trigger | Title font-size | Description opacity |
|---|---|---|---|
| **Resting** | No hover, not selected | `22px` | `0` |
| **Active** | Hover OR selected | `13px` (normal header size) | `1` |

## Layout contract

The header and description sections share a fixed combined height. In the resting state the title expands into the description area via `font-size` — the description is present in the DOM but invisible (`opacity: 0`, `max-height: 0` or equivalent). In the active state the title shrinks and the description region expands to its natural height.

## Transition timing

| Property | Duration | Easing |
|---|---|---|
| `font-size` | `220ms` | `ease-out` |
| `opacity` (description) | `180ms` | `ease-in` |
| `max-height` (description) | `220ms` | `ease-out` |

Entering active: title shrinks first, then description fades in.  
Returning to resting: description fades out first (80ms), then title expands.

## Accessibility

Users who have `prefers-reduced-motion: reduce` set should receive an instant switch (no transition) between states. The description text must always be reachable by screen readers regardless of visual opacity.
