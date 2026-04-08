---
name: Operations Test Playbook
description: "Playbook for verifying that all ArchUI components implement the operations contracts for error handling, monitoring, and structured logging."
---

## Playbook

### Group 1: Component Coverage of Operations Contracts

[init] A valid ArchUI project exists with CLI, GUI, and agent runtime all operational.

[action] Run archui validate on a project that has no errors.
[eval] The CLI emits INFO-level structured log entries, reports timing (duration_ms), and exits cleanly. Human-readable status is on stderr; NDJSON is in the log file.

[action] Trigger a SYNC_FAILURE in the GUI by making the LLM API unreachable during a file-sync operation.
[eval] The GUI preserves the original file contents, writes a structured log entry with error_category: SYNC_FAILURE, surfaces a notification to the user, and makes the operation retryable without manual reset.

[action] Start an agent session and verify it writes structured log entries at session start, per-module-touched, validation result, and session end.
[eval] The agent log file at ~/.archui/logs/agent-<session-id>.ndjson contains all four required event types with the correct fields.

[end] Restore LLM API access if disabled. Terminate the agent session. Confirm archui validate passes.

### Group 2: Error Handling Contract Compliance

[init] A valid ArchUI project exists. A README.md in one module has malformed YAML frontmatter (PARSE_ERROR).

[action] An agent attempts to read the malformed module's README.md in preparation for modifying it.
[eval] The agent detects the PARSE_ERROR, stops, and reports the error to the caller. No file modifications are attempted on the malformed file.

[action] Run archui validate on the project with the malformed file.
[eval] The CLI reports a PARSE_ERROR with the file path, line number, and YAML parser error message. Downstream operations that depend on the file's metadata are skipped.

[action] Fix the YAML frontmatter and re-run archui validate.
[eval] The PARSE_ERROR is cleared. The module is now readable and modifiable. Validation passes for that module.

[end] Restore the module's README.md to a valid state. Confirm archui validate passes.

### Group 3: Monitoring Thresholds

[init] A valid ArchUI project exists with more than 500 modules.

[action] Run archui validate and measure the wall-clock duration.
[eval] The duration is logged at INFO level with duration_ms. If the run exceeds 5 seconds, a performance regression is flagged for investigation.

[action] Open the GUI canvas with 60 visible nodes and perform a pan gesture.
[eval] Canvas FPS is at or above 60 FPS during the pan. If FPS drops below 30 with 50 or fewer visible nodes, a performance investigation is triggered.

[action] Trigger an LLM sync operation on a single changed file and measure response time.
[eval] The sync completes and duration_ms is logged at INFO level. If the response exceeds 30 seconds, the threshold is breached and investigation is required.

[end] No filesystem changes required. Log files capture the timing measurements for review.

### Group 4: Integration Points

[init] A valid ArchUI project exists. The GUI file-sync, CLI, and agent-orchestration modules are all active.

[action] Introduce an INDEX_STALE condition by adding a new module folder without running archui index.
[eval] The CLI detects INDEX_STALE, runs archui index --fix silently, confirms success, and proceeds. The user is not interrupted.

[action] Introduce a BROKEN_LINK by adding a links entry to a README.md that references a non-existent UUID.
[eval] archui validate reports BROKEN_LINK with the offending UUID and declaring file path. The agent must surface this to the user and await explicit instruction before modifying related files.

[action] Introduce a FILESYSTEM_ERROR by removing read permissions from a module's README.md, then run archui validate.
[eval] The CLI surfaces the OS permission error with errno, writes a structured log entry with error_category: FILESYSTEM_ERROR, and does not swallow the error silently.

[end] Restore read permissions, remove the broken link entry, and re-run archui index to clear INDEX_STALE. Confirm archui validate passes.
