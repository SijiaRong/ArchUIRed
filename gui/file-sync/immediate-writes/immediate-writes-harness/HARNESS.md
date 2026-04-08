---
name: Immediate Writes Test Playbook
description: Playbook for verifying that each immediate-write GUI action produces the correct deterministic filesystem effect without LLM involvement.
---

## Playbook

### Group 1: Module creation, rename, and deletion

[init] The GUI is open with a valid ArchUI project loaded. The canvas shows the root module with two existing submodules.

[action] Create a new module node on the canvas by clicking the "new module" action.
[eval] A new folder is created on disk at the expected path. A scaffold README.md is written inside it with a freshly generated UUID, a placeholder name, and an empty description. The parent module's submodules list is updated immediately. No LLM call is made.

[action] Rename the new module node by editing its name in the canvas detail panel.
[eval] The module folder is renamed on disk to match the new name (lowercased and hyphenated). The `name` field in the README.md frontmatter is updated. No LLM call is made.

[action] Delete the new module node via the canvas delete action (confirming the deletion dialog).
[eval] The module folder is removed from disk. The parent module's submodules list is updated to remove the entry. No LLM call is made.

[end] The project passes archui validate with no errors. No backup or LLM sync artifacts remain.

---

### Group 2: Link creation, removal, and node repositioning

[init] The GUI is open. Two module nodes are visible on the canvas with no links between them.

[action] Draw an edge from module A to module B by dragging from A's connection point and dropping on B.
[eval] A new entry is appended to module A's links array in its README.md frontmatter, referencing module B's UUID. The edge appears immediately on the canvas. No LLM call is made.

[action] Delete the edge by selecting it and pressing delete.
[eval] The corresponding entry is removed from module A's links array in its README.md frontmatter. The edge disappears from the canvas. No LLM call is made.

[action] Drag module A to a new position on the canvas.
[eval] The new position coordinates are written to .archui/layout.yaml under module A's UUID. No README.md files are modified. No LLM call is made.

[end] archui validate passes. layout.yaml reflects the updated position.
