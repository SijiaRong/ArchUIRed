---
name: Primary Module Card — Title Reveal
description: "An interaction-driven animation where the card title expands to fill the description area at rest, then contracts to its normal header size on hover or selection to reveal the description text beneath."
---

## Behaviour

In the resting state the card title is rendered at a larger size, visually occupying the description section so the card reads as a bold label. When the user hovers over the card or the card becomes selected, the title smoothly shrinks to its normal header size and the description text fades in from beneath.

The animation is purely cosmetic — the underlying DOM structure does not change. The description element is always present in the tree; only its opacity and the title's font-size transition.

Detailed interaction timing, easing curves, and annotated states are in `resources/spec.md`.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/typography/resources/token-table.md` for font-size tokens used in the title expand/collapse animation, and `gui/design-system/foundations/` for all other visual properties.
