---
name: Logging Test Playbook
description: "Playbook for verifying NDJSON log format correctness, required field presence, log file location conventions, and rotation policy enforcement."
---

## Playbook

### Group 1: NDJSON Format Correctness

[init] A valid ArchUI project exists. The CLI log at ~/.archui/logs/ is empty or absent.

[action] Run archui validate on a clean project.
[eval] A log file is created at ~/.archui/logs/cli-<YYYY-MM-DD>.ndjson. Every line in the file is a valid JSON object. No pretty-printing, trailing commas, or multi-line values appear. The file is valid NDJSON.

[action] Parse each line of the log file as JSON using jq or equivalent.
[eval] All lines parse without error. Each parsed object contains at minimum the four required fields: timestamp, level, component, and message.

[action] Inspect the timestamp field format in each entry.
[eval] Every timestamp is in ISO 8601 format with millisecond precision and UTC timezone, for example 2026-03-31T14:22:05.123Z.

[end] Log file remains at ~/.archui/logs/cli-<date>.ndjson. No module files are changed.

### Group 2: Required and Optional Fields

[init] A valid ArchUI project exists. A CLI validation run has just completed and a log file has been written.

[action] Check that every log entry contains timestamp, level, component, and message.
[eval] All four required fields are present in every log line. No entry is missing any of them.

[action] Check that every ERROR-level entry contains an error_category field.
[eval] All ERROR entries have error_category set to one of the defined categories. No ERROR entry omits this field.

[action] Inspect the message fields across all log entries.
[eval] All message values are static strings with no interpolated variable values. Variables (file paths, UUIDs, durations) appear in separate optional fields, not embedded in the message string.

[action] Check optional fields (module_uuid, file_path, duration_ms, agent_session_id) are present only on applicable events.
[eval] Optional fields appear only when contextually relevant. No entry contains an optional field with a null or empty value for a purpose it was not designed to serve.

[end] No filesystem changes required. Log file is unmodified after review.

### Group 3: Log File Locations

[init] A valid ArchUI installation exists. All log directories are absent (fresh install scenario).

[action] Run archui validate for the first time.
[eval] The directory ~/.archui/logs/ is created automatically (mkdir -p semantics). The CLI log file cli-<YYYY-MM-DD>.ndjson is created inside it. No user prompt or error occurs.

[action] Start a GUI session.
[eval] The GUI writes to ~/.archui/logs/gui-<YYYY-MM-DD>.ndjson and also to the OS-native app log directory (e.g., ~/Library/Logs/ArchUI/ on macOS). Both files are valid NDJSON.

[action] Start an agent session with a known session UUID.
[eval] A log file is created at ~/.archui/logs/agent-<session-id>.ndjson. The file is not date-rotated (unlike CLI and GUI logs). The session ID in the filename matches the agent_session_id field in all entries.

[end] Verify all three log file types exist in the correct locations. No module files changed.

### Group 4: Log Rotation Policy

[init] A valid ArchUI project exists. A log file from 31 days ago exists in ~/.archui/logs/.

[action] Run archui validate (triggering CLI startup logic).
[eval] The 31-day-old log file is automatically deleted at CLI startup. No user prompt or error occurs. The deletion is silent.

[action] Simulate a log file growing beyond 50 MB during a session by writing a large number of entries.
[eval] When the 50 MB threshold is crossed mid-session, the current file is renamed to <original-name>.1.ndjson and a new file is opened at the original path. At most one .1 backup is kept; older backups are deleted.

[action] Simulate a rotation failure (e.g., remove write permissions on the .1 backup file path) and then trigger rotation.
[eval] The rotation failure does not cause a user-visible error. Writing continues to the current log file. A single WARN entry is written to the log noting the rotation failure.

[action] Verify that log rotation never interrupts or fails a user operation.
[eval] The user-initiated action (validation run, GUI session, agent run) completes successfully regardless of whether rotation succeeded or failed.

[end] Restore all file permissions. Clean up oversized test log files. Confirm ~/.archui/logs/ is in a healthy state.
