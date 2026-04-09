---
name: "Primary Module Card — Port Section Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Primary Module Card — Port Section module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Primary Module Card — Port Section module.

---

## Playbook

### Group 1: Port section appears only for submodules with external links

[init] A canvas is open. The focused module has two direct submodules: Sub-A links to an external module (outside the hierarchy), and Sub-B links only to Sub-A (sibling-to-sibling link).

[action] Observe the primary card.
[eval] A port section is present below the description body, separated by a 1px dashed divider. Exactly one port row appears for Sub-A. Sub-B is NOT listed in the port section because its link to Sub-A is a sibling link (both endpoints within the same primary card).

[action] Check that the port divider is visible.
[eval] A 1px horizontal rule in `color/border/default` (dashed style) separates the description area from the port section.

[end] No cleanup required.

### Group 2: Source and target port rows render with correct visual treatment

[init] A canvas is open. The focused module has Sub-A (links OUT to an external module) and Sub-B (is linked TO by an external module). Both appear in the port section.

[action] Observe the source port row for Sub-A.
[eval] The row is 28px tall. The label "Sub-A" (or similar) appears near the right side of the row in a `color/port/{n}` tinted color. A ▶ indicator appears near the right edge (4px inset). A 8px circle handle appears on the right card edge, centered vertically on the row. Handle ID is `port-{Sub-A-uuid}-out`.

[action] Observe the target port row for Sub-B.
[eval] The label "Sub-B" appears near the left side in `color/text/tertiary`. A ◀ indicator appears near the left edge. An 8px circle handle appears on the left card edge, centered vertically on the row. Handle ID is `port-{Sub-B-uuid}-in`.

[action] Verify the port row height using the layout formula.
[eval] For the first row (i = 0), the handle Y position from the card top is approximately 103px (36 header + 52 body + 1 divider + 14 half-row). For the second row (i = 1), the handle Y is approximately 131px (103 + 28). These values must match the link-renderer edge endpoint calculations.

[end] No cleanup required.

### Group 3: A submodule with both incoming and outgoing links shows dual rows

[init] A canvas is open. The focused module has Sub-C which both receives an incoming link from an external module AND has an outgoing link to a different external module.

[action] Observe the port section.
[eval] Sub-C appears in the port section twice: once as a target row (◀ on left, label in `color/text/tertiary`) and once as a source row (▶ on right, label in `color/port/{n}` color). Both rows show the same submodule name but with distinct positioning and coloring.

[action] Hover over each row for Sub-C.
[eval] The target row handle appears on the left edge; the source row handle appears on the right edge. Both handles have handle ID containing Sub-C's UUID with `-in` and `-out` suffixes respectively.

[end] No cleanup required.

### Group 4: Double-clicking a port row drills into the submodule

[init] A canvas is open. The port section shows at least one port row for Sub-A.

[action] Double-click the port row for Sub-A.
[eval] The canvas re-renders with Sub-A as the new primary card. The breadcrumb trail updates to include Sub-A as the current level. Sub-A's own submodules (if any) are now shown as nodes on the canvas.

[action] Use the breadcrumb to navigate back to the parent canvas.
[eval] The parent primary card is restored with its port section showing Sub-A's port row again. Canvas state is consistent with the pre-drill position.

[end] No cleanup required.

### Group 5: Port section overflow collapses beyond 6 rows

[init] A canvas is open. The focused module has 8 submodules each with an external link (8 port rows total would be needed).

[action] Observe the port section.
[eval] Only 5 port rows are fully rendered. A "+3 more ▾" indicator appears as the 6th row, using `typography/ui-label` and `color/text/accent`. The card height reflects only 5 visible rows plus the indicator row (28px each = 168px port section height).

[action] Click the "+3 more ▾" indicator.
[eval] All 8 port rows become visible. The indicator row disappears. The card grows downward to accommodate the additional rows.

[end] No cleanup required.
