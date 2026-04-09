---
name: "Link Renderer — Port Edge Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Link Renderer — Port Edge module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Link Renderer — Port Edge module.

---

## Playbook

### Group 1: Port handle alignment with submodule rows

[init] A canvas is open. The focused module has three submodules — Sub-A, Sub-B, Sub-C — each occupying its own port row in the primary card's port section. Sub-B has an outgoing `depends-on` link to an external Module E.

[action] Observe the position of the source port handle (▶) for Sub-B on the primary card.
[eval] The handle is positioned at the right edge of the primary card, vertically centered on Sub-B's port row — not at the center of the entire card or the port section. The handle y-coordinate equals `port_row[Sub-B].top + port_row[Sub-B].height / 2`.

[action] Observe the port indicator circle on the edge near the primary card.
[eval] A small filled circle (radius 5px, fill: `color/edge/depends-on`) is drawn at the source port handle position, visually anchoring the edge to Sub-B's specific row.

[end] No state change needed; canvas remains open.

---

### Group 2: Outgoing port edge routes horizontally from the card edge

[init] A canvas is open. Sub-A of the focused module has a `references` link to external Module X. Module X is positioned to the right of the primary card.

[action] Observe the bezier curve of the port edge from Sub-A to Module X.
[eval] The edge departs horizontally (0° angle) from the right edge of the primary card at Sub-A's port row. The control point is at `(source.x + H, source.y)` where H is at least 80px. The edge does not visually cut through the primary card body.

[action] Observe the arrowhead on the edge.
[eval] The arrowhead is at the Module X end, pointing toward Module X's left-center anchor.

[end] No state change needed; canvas remains open.

---

### Group 3: Incoming port edge routes horizontally to the port handle

[init] A canvas is open. An external Module Y has an `implements` link to Sub-C of the focused module. Module Y is positioned to the left of the primary card.

[action] Observe the bezier curve of the incoming port edge from Module Y to Sub-C.
[eval] The edge arrives horizontally (0° angle) at the left edge of the primary card at Sub-C's port row. The final control point is at `(target.x - H, target.y)` where H is at least 80px. The shaft does not visually intersect the primary card body.

[action] Observe the arrowhead.
[eval] The arrowhead is at the Sub-C target port (◀ on the left edge of the card), pointing inward toward Sub-C's port row.

[end] No state change needed; canvas remains open.

---

### Group 4: Same-card rule — sibling port edges suppressed

[init] A canvas is open. Sub-A of the focused module has a `depends-on` link to Sub-B of the same focused module. Both appear in the port section of the primary card.

[action] Observe the canvas for a port edge between Sub-A's row and Sub-B's row on the primary card.
[eval] No edge is drawn between Sub-A and Sub-B. The same-card rendering rule suppresses the edge because both endpoints (Sub-A's source port and Sub-B's target port) are on the same primary card. No edge shaft, arrowhead, or relation label is visible for this link.

[end] No state change needed; canvas remains open.

---

### Group 5: Multiple port edges fan out when two submodules link to the same external card

[init] A canvas is open. Sub-A and Sub-B of the focused module each have a `depends-on` link to the same external Module Z. Module Z is visible as one external reference card.

[action] Observe the edges between the primary card and Module Z.
[eval] Two distinct bezier curves are drawn — one originating from Sub-A's port row, one from Sub-B's port row — both terminating at Module Z's left-center anchor. The edges arrive at Module Z at slightly different y-positions (or with a small angular fan) so they are visually distinguishable. Each edge has its own port indicator circle at the primary card end.

[end] No state change needed; canvas remains open.
