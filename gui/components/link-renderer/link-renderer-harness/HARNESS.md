---
name: Link Renderer Test Playbook
description: "Playbook for verifying that the link-renderer correctly draws directed edges between nodes, applies relation-type styling, handles external stubs, and shows tooltips."
---

## Playbook

### Group 1: Edges are drawn for links between visible nodes

[init] A canvas is open where Module A and Module B are both visible as nodes. Module A's README.md contains a link entry pointing to Module B's UUID with relation depends-on and a description.

[action] Observe the canvas for edges between Module A and Module B.
[eval] A directed edge is drawn from Module A's right connection point to Module B's left connection point, with an arrowhead at the Module B end. The label mid-edge reads "depends-on".

[action] Hover over the edge.
[eval] A tooltip appears showing the description text from the link entry in Module A's frontmatter.

[end] No state change needed; canvas remains open.

### Group 2: Relation types are visually distinct

[init] A canvas is open with multiple pairs of nodes linked by different relation types: one depends-on, one implements, one extends, one references, one related-to, and one custom relation.

[action] Observe the stroke style and color of the depends-on edge.
[eval] The edge is rendered with a solid, thick stroke in blue.

[action] Observe the stroke style and color of the implements edge.
[eval] The edge is rendered with a solid stroke in green.

[action] Observe the stroke style and color of the extends edge.
[eval] The edge is rendered with a dashed stroke in purple.

[action] Observe the stroke style and color of the references edge.
[eval] The edge is rendered with a dotted stroke in gray.

[action] Observe the stroke style and color of the custom relation edge.
[eval] The edge is rendered with a solid stroke in orange, distinguishing it from the standard vocabulary edges.

[end] No state change needed; canvas remains open.

### Group 3: Links without relation or description render correctly

[init] A canvas is open with two visible nodes. Node A's README.md has a link to Node B with no relation field and no description field (a bare link entry with only a uuid).

[action] Observe the edge between Node A and Node B.
[eval] An edge is drawn but has no relation label in the middle of the shaft.

[action] Hover over the edge.
[eval] No tooltip appears (or the tooltip is empty/absent) since no description was provided.

[end] No state change needed; canvas remains open.

### Group 4: External stubs for off-canvas link targets

[init] Module A is visible on the canvas. Module A has a node whose README.md contains a link to Module Z, which is not a submodule of the active module and is not visible on the current canvas.

[action] Observe the canvas for the link to Module Z.
[eval] A short stub edge (approximately 40px) is drawn from the source node's right connection point, ending with an external-link icon. The stub is labeled with Module Z's name, resolved from .archui/index.yaml.

[action] Click the external stub.
[eval] Navigation jumps to the canvas where Module Z lives, and Module Z's node is highlighted.

[end] Return to Module A's canvas using the breadcrumb trail.

### Group 5: Multiple links between the same pair of nodes are fanned

[init] A canvas is open where Module A has two separate link entries pointing to Module B — one with depends-on and one with references.

[action] Observe the canvas edges between Module A and Module B.
[eval] Two distinct edges are rendered between the nodes, fanned apart with a small angular offset so they do not fully overlap. Each edge has its own relation label.

[end] No state change needed; canvas remains open.
