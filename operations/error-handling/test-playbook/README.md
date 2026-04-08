---
name: Error Handling Test Playbook
description: "Playbook for verifying that each error category is correctly classified, surfaces with the right message, and triggers the specified recovery strategy without deviation."
---

## Playbook

### Group 1: VALIDATION_ERROR and PARSE_ERROR

[init] A valid ArchUI project exists with all modules passing validation.

[action] Remove the uuid field from one module's README.md frontmatter (creating a VALIDATION_ERROR).
[eval] archui validate reports VALIDATION_ERROR for that file, citing the specific missing field (uuid). The error is surfaced to the user; no auto-fix is attempted.

[action] An agent attempts to modify the file with the VALIDATION_ERROR.
[eval] The agent must stop and report the VALIDATION_ERROR to the caller. No file modifications are made.

[action] Introduce malformed YAML syntax in a different module's frontmatter (a PARSE_ERROR).
[eval] archui validate reports PARSE_ERROR with the file path, line number, and raw YAML parser error message. No fields are extracted from the partially-parsed frontmatter block.

[action] Fix the YAML syntax error and re-run validation.
[eval] The PARSE_ERROR is cleared. The module parses correctly and any downstream metadata operations can proceed.

[end] Restore the uuid field in the first module. Confirm archui validate passes for both modules.

### Group 2: BROKEN_LINK and INDEX_STALE

[init] A valid ArchUI project exists with index.yaml fully in sync.

[action] Add a links entry to a module's README.md referencing a UUID that does not appear in index.yaml.
[eval] archui validate reports BROKEN_LINK, identifying the unresolvable UUID and the declaring README.md file path. The tool suggests running archui index --fix if the target directory exists but is absent from index.yaml.

[action] Create a new module folder on disk without running archui index (creating INDEX_STALE).
[eval] archui validate or the next CLI/GUI operation detects INDEX_STALE and runs archui index --fix silently. The user is not prompted; the auto-fix succeeds and the new module is now indexed.

[action] After archui index --fix completes, verify the broken link from the first action is now resolved (if the new module folder was the missing target).
[eval] If the new folder's UUID matches the broken link, BROKEN_LINK is now cleared. If not, BROKEN_LINK persists and the user must remove the link or create the missing module.

[end] Remove the orphan link entry or the new module folder. Confirm archui validate passes.

### Group 3: SYNC_FAILURE and FILESYSTEM_ERROR

[init] A valid ArchUI project exists with the GUI active. An LLM sync operation is in progress on a target file.

[action] Cut the network connection mid-sync, causing the API call to fail.
[eval] The original file is intact (write was atomic or not yet started). A structured SYNC_FAILURE log entry is written. The user receives a notification identifying the target file. The operation is retryable without manual state reset.

[action] Remove write permissions from a module folder and then attempt an agent write to that folder.
[eval] The OS returns a permission error. The CLI or agent surfaces the FILESYSTEM_ERROR with the OS error message and errno. The error is not translated into a generic message. A structured log entry is written.

[action] Restore write permissions and verify the agent or CLI can retry the operation successfully.
[eval] The write succeeds on retry. No prior state reset is needed. The FILESYSTEM_ERROR is cleared.

[end] Restore all permissions. Confirm network is reconnected. Confirm archui validate passes.

### Group 4: GUI Error Presentation

[init] A valid ArchUI project exists with the GUI canvas open. All modules show no error badges.

[action] Introduce a VALIDATION_ERROR in one module's README.md.
[eval] The corresponding module node in the canvas displays a yellow status badge. Hovering the badge shows a tooltip with the error category and the first line of the error message.

[action] Open the global error panel from the toolbar.
[eval] The panel lists all current errors grouped by category, showing the file path and full message for each. The VALIDATION_ERROR for the affected module is present.

[action] Fix the VALIDATION_ERROR and run archui validate.
[eval] The yellow badge disappears from the module node. The global error panel updates in real time and no longer shows the resolved error.

[action] Introduce a FILESYSTEM_ERROR (e.g., disk full simulation) and observe the GUI.
[eval] The affected module node shows a red status badge (not yellow). The global error panel shows the error under the FILESYSTEM_ERROR category.

[end] Resolve all introduced errors. Confirm the GUI canvas shows no error badges on any module. Confirm archui validate passes.
