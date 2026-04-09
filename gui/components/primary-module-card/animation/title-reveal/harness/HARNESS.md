---
name: "Primary Module Card — Title Reveal Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Primary Module Card — Title Reveal module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Primary Module Card — Title Reveal module.

---

## Playbook

### Group 1: Resting state — title is expanded, description is hidden

[init] A canvas is open. A primary card is visible with no hover or selection (fully at rest).

[action] Observe the primary card title.
[eval] The title font-size is approximately 22px — visually larger than normal, filling the description area. The card title reads as a bold label occupying the space where the description would be.

[action] Observe the description body area.
[eval] The description section has zero visible height. No description text is visible. There is no empty gap between the header and the port section (or card bottom if no ports exist). The description element exists in the DOM but has `opacity: 0` and `max-height: 0` (or equivalent collapsed state).

[end] No cleanup required.

### Group 2: Hover triggers title shrink and description reveal

[init] A canvas is open. A primary card is at rest (title expanded to 22px, description hidden).

[action] Move the cursor onto the primary card.
[eval] The card begins animating immediately. The title font-size shrinks from 22px toward 14px (`typography/node-name`). The description container's `max-height` begins expanding. After approximately 40ms, the description text begins fading in (`opacity: 0 → 1`).

[action] Wait 250ms after starting the hover.
[eval] The animation is complete. Title is at 14px. Description is fully expanded (52px height, `opacity: 1`). Description text is readable at `typography/node-description` (13px, 400) in `color/text/secondary`. The card has grown downward only; no content above the header has shifted.

[action] Move the cursor off the card.
[eval] The description text immediately begins fading out (80ms). After 80ms, the title begins expanding back to 22px and the description container collapses. Total return-to-rest duration is approximately 300ms. The card shrinks back to its resting height.

[end] No cleanup required.

### Group 3: Selection holds the active state regardless of hover

[init] A canvas is open. A primary card is at rest (title expanded, description hidden).

[action] Single-click the primary card (do not hover first — click directly).
[eval] The card enters the selected state AND the active (description-revealed) state simultaneously. The title shrinks to 14px, the description expands, the border becomes 2px `color/border/focus`.

[action] Move the cursor off the selected card.
[eval] The description does NOT collapse. The card remains in the active state (title at 14px, description expanded) because selection persists. The border and background remain in the selected style.

[action] Click empty canvas to deselect.
[eval] The card returns to rest: title expands back to 22px, description fades out and collapses. The card shrinks to its resting height.

[end] No cleanup required.

### Group 4: Reduced motion preference disables transitions

[init] A canvas is open. The operating system or browser has `prefers-reduced-motion: reduce` enabled.

[action] Move the cursor onto a primary card.
[eval] The description section appears instantly — no animation. The title is immediately at 14px and the description is immediately at `opacity: 1` and full height. No interpolation or easing occurs.

[action] Move the cursor off the card.
[eval] The description disappears instantly. The title is immediately at 22px. No animation.

[action] Single-click the card to select it, then press Escape.
[eval] Both the transition into and out of the selected/active state happen instantly, with no animated transition.

[end] Disable `prefers-reduced-motion` to restore default behavior.

### Group 5: DOM structure remains constant across state changes

[init] A canvas is open. A primary card is visible.

[action] Open browser developer tools. Inspect the card's DOM before hovering.
[eval] The description element is present in the DOM tree at all times (not inserted/removed). It has `opacity: 0` and `max-height: 0` (or `height: 0; overflow: hidden`) in the resting state.

[action] Hover over the card and inspect the DOM during the active state.
[eval] The same description element now has `opacity: 1` and a positive `max-height` (or `height`). No new DOM elements were created during the transition.

[action] Verify screen reader accessibility: use a screen reader to navigate to the primary card.
[eval] The screen reader announces the description text regardless of its visual opacity. The description content is NOT hidden from assistive technology (`aria-hidden` is not `true` on the description container).

[end] Close developer tools.
