---
name: Link Renderer Test Playbook
description: "Playbook for verifying that the link-renderer correctly draws directed edges between nodes, applies relation-type styling, handles external stubs, and shows tooltips."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Playbook

### Group 1: Direct edge rendering for a focused module's own link

[init] A canvas is open. The focused module has one outgoing `depends-on` link to an external Module B. Module B is visible as an external reference card. The link entry includes both a `relation` and a `description`.

[action] Observe the canvas for edges connected to the primary card's description section.
[eval] A directed edge is drawn from the module source handle (▶) on the right edge of the description section to Module B's left-center anchor. The arrowhead is at the Module B end. The label "depends-on" is rendered as a pill centered at the edge midpoint.

[action] Hover over the edge shaft.
[eval] A tooltip appears showing the `description` value from the link entry. The tooltip uses `surface/overlay` background and `text/primary` foreground, max 240px wide.

[end] No state change needed; canvas remains open.

### Group 2: Port edge rendering for a submodule's link

[init] A canvas is open. Sub-A of the focused module has an `implements` link to external Module C. Module C is visible as an external reference card. Sub-A's row is the second row in the port section.

[action] Observe the port edges on the canvas.
[eval] A directed edge is drawn from Sub-A's source port handle (▶) — at the right edge of the primary card, vertically aligned with Sub-A's port row center — to Module C's left-center anchor. The arrowhead is at Module C. A small filled circle (port indicator, radius 5px, fill: `color/edge/implements`) is rendered at the source port handle end.

[action] Observe the bezier curve shape near the primary card.
[eval] The edge departs horizontally from the primary card's right edge (0° angle) — it does not cut through the card body. The control point offset is at least 80px.

[end] No state change needed; canvas remains open.

### Group 3: Links without relation or description render correctly

[init] A canvas is open. A submodule Sub-B has a link to an external Module D with no `relation` field and no `description` field (bare link entry with only a `uuid`).

[action] Observe the port edge between Sub-B and Module D.
[eval] A port edge is drawn using the default stroke style (`color/edge/default`, 1px solid). No relation label pill is rendered at the midpoint — the midpoint area is empty.

[action] Hover over the edge shaft.
[eval] No tooltip appears. The hover state only raises the edge z-order; no tooltip element is shown because no `description` was provided.

[end] No state change needed; canvas remains open.

### Group 4: Same-card rule suppresses both module-to-submodule and sibling links

[init] A canvas is open. The focused module has a `depends-on` link to its own Sub-A. Sub-A has a `references` link to sibling Sub-B. Both submodules are visible in the primary card's port section.

[action] Observe the canvas for any edges drawn between the description section and Sub-A's port row.
[eval] No edge is drawn. The focused module → Sub-A link is suppressed because both endpoints are on the same primary card (the description section handle and Sub-A's port row are both on the primary card).

[action] Observe the canvas for any edges drawn between Sub-A's port row and Sub-B's port row.
[eval] No edge is drawn. The Sub-A → Sub-B sibling link is also suppressed by the same-card rule. No shaft, arrowhead, or label is visible for either suppressed link.

[end] No state change needed; canvas remains open.

### Group 5: Relation label display and all standard relation types are visually distinct

[init] A canvas is open with five external reference cards. The focused module (or its submodules) has one link to each external card, using relation types: `depends-on`, `implements`, `extends`, `references`, and `related-to`. A sixth link uses a custom relation string "monitors".

[action] Observe the stroke style and color of each edge in turn.
[eval] Each edge is visually distinct per the edge styling reference table:
- `depends-on`: 2px solid stroke, `color/edge/depends-on` (blue)
- `implements`: 1.5px solid stroke, `color/edge/implements` (green)
- `extends`: 1.5px dashed stroke (6px/3px), `color/edge/extends` (purple)
- `references`: 1px dotted stroke (2px/4px), `color/edge/references` (gray)
- `related-to`: 1px dotted stroke (2px/4px), `color/edge/related-to` (gray)
- "monitors" (custom): 1.5px solid stroke, `color/edge/custom` (orange)

[action] Observe the relation label at the midpoint of each edge.
[eval] Each edge shows its relation string as a pill label centered at the shaft midpoint. The `extends` label is italicized; all others are in normal weight. All labels use `text/tertiary` color on a pill background with 4px padding and 4px corner radius.

[end] No state change needed; canvas remains open.
