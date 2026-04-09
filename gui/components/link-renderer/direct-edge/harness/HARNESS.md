---
name: "Link Renderer — Direct Edge Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Link Renderer — Direct Edge module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Link Renderer — Direct Edge module.

---

## Playbook

### Group 1: Arrowhead direction on outgoing direct edge

[init] A canvas is open. The focused module has one outgoing direct link to Module B (relation: `depends-on`). Module B is visible as an external reference card.

[action] Observe the edge between the focused module and Module B.
[eval] A directed edge is drawn from the module source handle (▶) on the right edge of the description section to Module B's left-center anchor. The arrowhead is at the Module B end — pointing toward Module B, not toward the focused module.

[action] Observe the arrowhead shape.
[eval] The arrowhead is a solid filled triangle, approximately 10px base × 8px height, filled with the same color as the `depends-on` stroke (`color/edge/depends-on`).

[end] No state change needed; canvas remains open.

---

### Group 2: Arrowhead direction on incoming direct edge

[init] A canvas is open. An external Module X has a link to the focused module (relation: `implements`). Module X is visible as an external reference card.

[action] Observe the edge between Module X and the focused module.
[eval] A directed edge is drawn from Module X's right-center anchor to the module target handle (◀) on the left edge of the description section. The arrowhead is at the focused module end — pointing toward the module target handle.

[action] Observe which side of the primary card shows the connection handle.
[eval] Only the left-side handle (◀) is rendered on the description section. No right-side handle is present because there are no outgoing links from the focused module.

[end] No state change needed; canvas remains open.

---

### Group 3: Handle visibility — only shown when direct edges exist

[init] A canvas is open. The focused module has no outgoing links to any external module and no external modules link to it. The primary card is displayed with a description section.

[action] Observe the left and right edges of the description section on the primary card.
[eval] No handles (▶ or ◀) are rendered on the description section. Both handles are hidden because no direct edges exist in either direction.

[action] The focused module's `.archui/index.yaml` is updated to add a `depends-on` link to Module Y. Module Y is visible as an external reference card.
[eval] The module source handle (▶) appears on the right edge of the description section. An edge is now drawn from that handle to Module Y. The left-side handle (◀) remains hidden because no external modules link to the focused module.

[end] Undo the added link. Canvas returns to no-handle state.

---

### Group 4: Same-card rule — link to own submodule is suppressed

[init] A canvas is open. The focused module has a `depends-on` link to Sub-A, which is one of its own direct submodules. Sub-A appears in the port section of the primary card.

[action] Observe the canvas for an edge between the primary card's description section and Sub-A's port row.
[eval] No edge is drawn between any description-section handle and Sub-A's port row. The same-card rendering rule suppresses this edge because both endpoints are on the same primary card.

[action] Observe the primary card's description section handles.
[eval] No module-level handles (▶ or ◀) are rendered on the description section — the link to Sub-A does not count as a direct edge to an external card.

[end] No state change needed; canvas remains open.

---

### Group 5: Selection state and delete affordance

[init] A canvas is open with two external reference cards visible. The focused module has one `references` link to each external card.

[action] Click the edge connecting the focused module to the first external card.
[eval] The edge is selected: its stroke color shifts to `color/accent/primary` regardless of the `references` relation color. A delete affordance (×) appears centered at the edge midpoint.

[action] Click the delete affordance (×).
[eval] The edge is removed from the canvas. The corresponding link entry is removed from the focused module's `.archui/index.yaml`. If this was the only outgoing link, the module source handle (▶) disappears from the description section.

[end] Undo the deletion to restore the original canvas state.
