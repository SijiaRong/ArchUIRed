---
name: File Sync Test Playbook
description: "Playbook for verifying that file-sync correctly handles immediate writes, deferred LLM sync, index.yaml maintenance, and live file-watching."
---

## Playbook

### Group 1: Immediate writes for simple GUI actions

[init] The GUI is open with a valid ArchUI project. No LLM sync has been triggered.

[action] Create a new module by drawing a node on the canvas and giving it a name.
[eval] A new folder is created on disk with a scaffolded README.md containing a fresh UUID, name, and empty submodules and links fields. The new module appears in .archui/index.yaml. No LLM sync is triggered.

[action] Rename an existing module via the context menu (right-click > Rename).
[eval] The module's folder is renamed on disk. The name field in the module's README.md frontmatter is updated. The entry in .archui/index.yaml is updated to the new path. No LLM sync is triggered.

[action] Delete a module via the context menu (right-click > Delete), confirming the deletion prompt.
[eval] The module's folder is removed from disk. The entry is removed from the parent's submodules list in the parent's README.md. The entry is removed from .archui/index.yaml. No LLM sync is triggered.

[end] Restore the deleted module and its README.md. Revert any renames. Confirm .archui/index.yaml is consistent.

### Group 2: Immediate write for add/remove link

[init] The GUI is open. Module A and Module B are visible on the canvas with no links between them.

[action] Draw an edge from Module A's connection point to Module B, selecting relation type "depends-on".
[eval] Module A's README.md frontmatter links array is updated immediately to include an entry with Module B's UUID and relation "depends-on". The edge appears on the canvas. No LLM sync is triggered.

[action] Delete the edge by selecting it and pressing Delete.
[eval] The link entry for Module B is removed from Module A's README.md frontmatter links array. The edge disappears from the canvas. No LLM sync is triggered.

[end] Confirm Module A's README.md links field is back to its pre-test state.

### Group 3: Deferred write — module move queues LLM sync

[init] A module exists nested under one parent. The GUI is open. LLM sync has not been triggered recently.

[action] Move the module to a different parent via the canvas context menu (right-click > Move).
[eval] The folder is moved on disk immediately. The old parent's submodules list is updated. The new parent's submodules list is updated. .archui/index.yaml is updated with the new path. The GUI shows a pending sync indicator signaling that propagation may be needed.

[action] Check that no LLM sync has run automatically yet.
[eval] No AI-generated patches have been applied. The move is reflected in the filesystem but dependent modules with references to the moved module have not yet been updated.

[action] Trigger LLM sync explicitly.
[eval] The sync process reads the git diff, identifies impacted modules, passes them to the LLM, receives patches, applies them, and commits. The sync indicator returns to idle.

[end] Revert the move by moving the module back to its original parent. Confirm .archui/index.yaml is consistent.

### Group 4: File watching detects external edits and updates the GUI

[init] The GUI is open. A module-node is visible on the canvas with a known description.

[action] Open the module's README.md in an external text editor and change the description field. Save the file.
[eval] The GUI detects the change via file-watching and re-renders the affected node with the updated description, without any user action in the GUI.

[action] In the terminal, create a new subfolder with a valid README.md under the currently active module's path.
[eval] The GUI detects the new folder, adds the new module to .archui/index.yaml, and emits a new-module event causing a new node to appear on the active canvas.

[end] Remove the externally created folder. Revert the description change. Confirm the canvas reflects the original state.

### Group 5: .archui/index.yaml is the only writer of index state

[init] The GUI is open and .archui/index.yaml is in a consistent known state.

[action] Create two new modules via the GUI canvas.
[eval] Both new modules appear in .archui/index.yaml with their UUIDs mapped to their correct paths. No other component has modified the file.

[action] Manually edit .archui/index.yaml in a text editor to introduce an incorrect path for one module, then perform a GUI action that reads that module.
[eval] The GUI attempts to resolve the UUID to the incorrect path and fails gracefully, showing an error state for the affected node. File-sync detects the inconsistency.

[end] Restore .archui/index.yaml to a consistent state by correcting the manual edit.
