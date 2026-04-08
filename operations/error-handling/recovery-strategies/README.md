---
name: Recovery Strategies
description: "Per-category recovery strategies for all six ArchUI error categories, GUI error presentation rules, and agent error handling constraints."
---

## Overview

Once an error is classified (see `error-taxonomy/`), the recovery strategy for that category must be applied exactly. Deviating — particularly attempting to auto-fix errors that are designated as user-surfaced-only — is itself a contract violation.

## Recovery Strategies by Category

**`VALIDATION_ERROR` — Surface to user; do not auto-fix**
Report the full file path of the offending README.md and the specific rule that was violated (e.g., "missing required field: `uuid`", "non-`resources/` subfolder found: `assets/`"). Do not attempt to insert missing fields or restructure the file. The user or a human-reviewed agent action must fix it.

**`PARSE_ERROR` — Surface the YAML error with line number; do not interpret partial frontmatter**
Pass the raw YAML parser error message (including line and column number) to the user. Do not attempt to extract any fields from a partially-parsed frontmatter block — treat the entire frontmatter as unavailable. Downstream operations that depend on this file's metadata must be skipped or aborted.

**`BROKEN_LINK` — Surface the broken UUID and declaring file; suggest `archui index --fix`**
Report the UUID that could not be resolved and the path of the README.md that contains the broken `links` entry. If the target module directory exists on disk but is absent from `index.yaml` (i.e., the index is stale), suggest running `archui index --fix` to rebuild the index. If the directory does not exist, the user must either remove the link or create the missing module.

**`INDEX_STALE` — Auto-recoverable; run `archui index --fix` silently**
This is the one error category where silent auto-recovery is permitted. Run `archui index --fix` without prompting the user, unless `index.yaml` contains manual edits. If the auto-fix fails, escalate to `FILESYSTEM_ERROR` or `VALIDATION_ERROR` as appropriate.

**`SYNC_FAILURE` — Preserve original files; log; notify user; allow retry**
Never partially write a file during a sync operation. All writes must be atomic (write to a temp file, then rename). On failure: (1) ensure the original file is intact, (2) write a structured log entry with `error_category: SYNC_FAILURE` and the failure reason, (3) surface a notification to the user identifying which file the sync was targeting, (4) make the operation retryable without requiring the user to manually reset any state.

**`FILESYSTEM_ERROR` — Surface the OS error; never swallow silently**
Pass the OS error message and errno (if available) directly to the user interface. Log a structured entry with `error_category: FILESYSTEM_ERROR`. Retry at most three times with exponential backoff for `EAGAIN`/`EWOULDBLOCK` only; surface all other errors immediately.

## GUI Error Presentation

- Each module node displays a **status badge** when errors are associated with that module's README.md. Badge color: yellow for `VALIDATION_ERROR` / `PARSE_ERROR` / `BROKEN_LINK` / `INDEX_STALE`; red for `SYNC_FAILURE` / `FILESYSTEM_ERROR`.
- Hovering the badge shows a **tooltip** with the error category and the first line of the error message.
- A **global error panel** (accessible from the toolbar) lists all current errors across all modules, grouped by category, with the file path and full message for each. Errors are cleared when the underlying condition is resolved.
- The global error panel updates in real time as `archui validate` or `archui index` runs complete.

## Agent Error Handling Rules

1. **Blockers — agents must not proceed:** `VALIDATION_ERROR`, `PARSE_ERROR`. If either is present for a file the agent intends to read or modify, the agent must stop, report the error to the caller, and take no further file action.
2. **Auto-recoverable — agent may fix silently:** `INDEX_STALE` only. Run `archui index --fix`, confirm it succeeded, then proceed.
3. **User-decision required:** `BROKEN_LINK`, `SYNC_FAILURE`, `FILESYSTEM_ERROR`. The agent must surface these to the user and await explicit instruction before retrying or modifying any related files.
4. Agents must never modify `index.yaml` directly. All index mutations must go through `archui index` commands.
