---
name: Log Rotation
description: "Log file rotation policy — 30-day age limit, 50 MB mid-session size limit, and failure handling rules for all ArchUI components."
---

## Rotation Rules

**Age-based:** Log files older than **30 days** are automatically deleted at the start of each CLI invocation and each GUI session launch.

**Size-based:** A log file that grows beyond **50 MB** mid-session is rotated: the current file is renamed to `<original-name>.1.ndjson` and a new file is opened at the original path. At most one `.1` backup is kept; older backups are deleted.

## Failure Handling

Log rotation must never cause a write failure or a user-visible error. If rotation fails (e.g., permission error on the `.1` file), continue writing to the current file and emit a single `WARN` entry noting the rotation failure.
