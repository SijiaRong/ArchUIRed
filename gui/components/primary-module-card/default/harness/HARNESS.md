---
name: "Primary Module Card — Default State Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Primary Module Card — Default State module."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

This playbook verifies the behaviour and structural constraints defined in the Primary Module Card — Default State module.

---

## Playbook

### Group 1: Default state visual properties match the spec

[init] A canvas is open with a module in focus. The primary card for the focused module is visible. The module has no uncommitted changes (clean git state) and is not selected.

[action] Observe the primary card's outer container.
[eval] The card has a 1px border in `color/border/subtle`, 8px corner radius, `color/surface/default` background, and `elevation/card/default` box-shadow. The card width is 240px.

[action] Observe the header section.
[eval] The header is 36px tall. The status dot is 6px circle in `color/status/clean` (gray). The module name is rendered at `typography/node-name` (14px, 600) in `color/text/primary`. The UUID is rendered at `typography/ui-meta` (11px, 400) in `color/text/tertiary`. The drill-in [↗] icon is visible at approximately 0.4 opacity.

[action] Observe the area below the header without interacting.
[eval] The description body section has zero visible height (collapsed). The port section (if any ports exist) appears directly below the header divider, with a 1px dashed divider.

[end] No cleanup required; canvas remains in default state.

### Group 2: Description collapse and expand on hover

[init] A canvas is open. A primary card is visible with no current hover or selection. The module has a non-empty description.

[action] Move the cursor onto the primary card body.
[eval] The description section begins expanding. The card title font-size transitions from 22px toward 14px (`typography/node-name`). The description text fades in (`opacity: 0 → 1`). The card grows downward; no content above the header shifts position.

[action] Hold the cursor on the card until the animation completes (wait at least 250ms).
[eval] The description section is fully expanded to approximately 52px height. The description text is legible at `typography/node-description` (13px, 400) in `color/text/secondary`. The title is at its normal 14px weight.

[action] Move the cursor off the primary card.
[eval] The description text fades out first, then the card collapses: the title expands back to 22px and the description section returns to zero height. The sequence takes approximately 300ms total.

[end] No cleanup required.

### Group 3: Module-level handles appear only when module-level links exist

[init] A canvas is open. One visible primary card corresponds to a module with NO entries in its own `links` array (only submodule links, if any).

[action] Hover over the primary card.
[eval] No connection handles (◀/▶) appear on the edges of the description section. The port section handles (if any) appear on port row edges only.

[action] Add a `links` entry to the module's `.archui/index.yaml` pointing to any external UUID. Reload the canvas.
[eval] After the change, hovering over the primary card now shows a source handle (▶) on the right edge of the description section, centered vertically within the description area (Y ≈ 62px from card top).

[end] Remove the test links entry from `.archui/index.yaml`. Confirm no handles appear on hover.

### Group 4: External reference card renders flat with correct typography

[init] A canvas is open with at least one external reference card visible.

[action] Observe an external reference card.
[eval] The card has no box-shadow (flat). The border is 1px `color/border/subtle`. Corner radius is 8px. The card is narrower than the primary card (content-sized, not fixed 240px).

[action] Observe the text content of the external card.
[eval] The module name renders at `typography/node-name` (14px, 600) in `color/text/primary`. The UUID renders at `typography/ui-meta` (11px, 400) in `color/text/tertiary`, more dimmed than the primary card's UUID.

[action] Observe the handle on the external reference card.
[eval] Exactly one handle (8px circle) is visible, positioned on the left or right edge depending on link direction. The handle fill is `color/surface/default` with 1.5px `color/border/default` stroke.

[end] No cleanup required.

### Group 5: Port section rows and handles match link data

[init] A canvas is open. The primary card corresponds to a module with at least two submodules — one that links OUT to an external module, and one that is linked TO by an external module.

[action] Observe the port section.
[eval] A 1px dashed horizontal divider separates the description area from the port section. There is at least one target port row (◀ on left edge, label in `color/text/tertiary`) and at least one source port row (▶ on right edge, label in a `color/port/{n}` color).

[action] Hover over a port row.
[eval] The row receives a `color/interactive/hover` background overlay. The port handle is visible on the respective edge, centered vertically on that row.

[action] Verify the source port row color assignment.
[eval] The source port label color matches the `color/port/{n}` value corresponding to the index of the associated external reference card on the canvas (0-indexed, round-robin).

[end] No cleanup required.
