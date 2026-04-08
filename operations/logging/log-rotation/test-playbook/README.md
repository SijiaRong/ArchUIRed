---
name: Log Rotation Test Playbook
description: "Test playbook for verifying age-based deletion, size-based mid-session rotation, and silent failure handling for log rotation."
---

## Playbook

[init] `~/.archui/logs/` contains three log files: one from today, one from 15 days ago, and one from 35 days ago.

[action] Run `archui validate` (which triggers rotation cleanup at invocation start).
[eval] The 35-day-old file is deleted. The 15-day-old file and today's file are retained. No error is shown to the user. No log entry is emitted for the routine deletion.

[end] Two log files remain. The oldest surviving file is 15 days old.

---

[init] A CLI run is in progress. The current log file `cli-<today>.ndjson` is at 49.9 MB and is still being written to.

[action] The log file grows past 50 MB mid-run.
[eval] The current file is renamed to `cli-<today>.ndjson.1.ndjson`. A new `cli-<today>.ndjson` is opened. Writing continues to the new file without interruption. No user-visible error occurs.

[action] The log file grows past 50 MB again (a second rotation during the same session).
[eval] The existing `.1` backup is deleted. The current file becomes the new `.1` backup. A fresh file is opened. At most one `.1` backup exists at any time.

[end] The log directory contains `cli-<today>.ndjson` (current, actively written) and `cli-<today>.ndjson.1.ndjson` (the most recent backup). No older backups remain.

---

[init] A log rotation is about to occur but the `.1` backup file has a permission error that prevents renaming.

[action] The rotation attempt fails due to the permission error.
[eval] A single `WARN`-level entry is written to the current log file noting the rotation failure. Writing continues to the current (oversized) file. No exception is raised. No user-visible error is shown.

[end] The CLI completes normally. The only evidence of the rotation failure is the single WARN log entry.
