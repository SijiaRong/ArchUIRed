---
name: Primary Module Card Test Playbook
description: "Playbook for verifying that primary module cards correctly display module data, reflect filesystem state variants, and respond to user interactions."
---

## Playbook

### Group 1: Node displays correct data from README.md frontmatter

[init] A canvas is open with a module in focus. One of the visible primary cards corresponds to a submodule with known name and description values in its README.md frontmatter.

[action] Observe the header area of the node.
[eval] The node header displays the module's name exactly as specified in the frontmatter name field.

[action] Observe the body area of the node.
[eval] The node body displays the module's description exactly as specified in the frontmatter description field.

[action] Edit the submodule's README.md to change both name and description. Save the file.
[eval] The node re-renders automatically, showing the updated name in the header and updated description in the body, without reloading the GUI.

[end] Revert the README.md to its original name and description values. Confirm the node updates back.

### Group 2: Node state variants reflect filesystem status

[init] A canvas is open. One visible node corresponds to a module that is committed and has no uncommitted changes (Clean state).

[action] Observe the node's visual appearance.
[eval] The node renders in its Clean state: no amber accent, no dashed border, no red border. The status dot in the header is green.

[action] Edit the module's README.md without committing the change (leave it as an uncommitted modification).
[eval] The node updates to the Modified state: the header shows an amber accent. The status dot is amber.

[action] Delete the README.md from a different module's folder (leaving the folder without a README).
[eval] The node for that module renders in the Error state: red border, and an error message appears in the node body area.

[end] Restore the deleted README.md. Commit or revert the uncommitted change. Confirm affected nodes return to Clean state.

### Group 3: Node interaction behaviors

[init] A canvas is open with at least one primary card visible. No node is currently selected.

[action] Single-click a primary card.
[eval] The node enters a selected state (visual selection indicator). A detail panel opens showing the full README preview and an edit button.

[action] Double-click the same primary card.
[eval] The canvas drills into that module: the canvas re-renders with that module's submodules as the new set of nodes, and the breadcrumb trail updates.

[action] Navigate back to the parent canvas. Right-click the primary card.
[eval] A context menu appears with options including: Open in editor, Rename, Move, Delete, Copy UUID.

[end] Dismiss all menus and panels. Confirm the canvas is in its default unselected state.

### Group 4: Node drag repositions without changing folder structure

[init] A canvas is open. A primary card is visible at a known position. The folder structure on disk is confirmed.

[action] Drag the primary card to a new position on the canvas.
[eval] The node moves to the new position. The folder structure on disk is unchanged — the module folder has not moved. The new position is persisted in .archui/layout.yaml.

[action] Hover over the right connection point of a primary card.
[eval] A plus (+) affordance appears on the connection point, indicating a new link edge can be created.

[end] Move the node back to its original position by dragging, or delete the layout entry for it from .archui/layout.yaml.
