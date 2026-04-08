---
name: LLM Sync Test Playbook
description: "Playbook for verifying the on-demand LLM sync flow, atomic write safety, file-watch live update, and correct behavior on SYNC_FAILURE."
---

## Playbook

### Group 1: LLM sync flow

[init] The GUI is open with a valid ArchUI project. The user has made several edits: moved a module to a new parent, and edited a module's description. These changes are committed in git but the sync has not been triggered.

[action] The user clicks the "Sync" button in the GUI.
[eval] The sync layer runs git diff HEAD to collect changes since the last sync point. It parses the diff and identifies the moved module and the edited description. It finds all modules that reference either via UUID. It passes the diff plus the impacted modules' README content to the LLM with the sync prompt.

[action] The LLM returns a patch set updating the parent references in affected modules.
[eval] File-sync validates the patch set (each patch targets a real file, modifies only frontmatter fields, and produces valid YAML). The patches are applied atomically to disk. A git commit is created with the propagated changes. .archui/index.yaml is updated to reflect any path changes.

[end] archui validate passes with no errors after the sync commit.

---

### Group 2: SYNC_FAILURE handling and file watching

[init] The GUI is open. The LLM sync endpoint is configured to return an invalid API response (simulating a network or API failure).

[action] The user triggers LLM sync.
[eval] The sync flow reaches the LLM call step and receives an invalid response. File-sync does not write any files (all writes are atomic and were not yet committed). The original README.md files remain intact. A structured log entry with error_category: SYNC_FAILURE is written. The user sees a notification identifying the targeted file and a retry button. No state reset is required to retry.

[action] Restore the LLM endpoint to working state and click the retry button.
[eval] The sync completes successfully on retry. The patches are applied and committed.

[action] While the GUI is open, edit a module's README.md in an external text editor and save it.
[eval] The file watcher detects the change. The canvas re-renders the affected node with the updated name and description from the new frontmatter. No LLM sync is triggered automatically. Only the canvas rendering updates.

[end] archui validate passes. No spurious LLM calls were made by file watching.
