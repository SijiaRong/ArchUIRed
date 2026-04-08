---
name: Log Schema
description: "NDJSON format specification, log levels, required fields, and optional fields for all ArchUI log entries across CLI, GUI, and agent runtime."
---

## Format

Each log entry is one JSON object per line, terminated by a newline character (`\n`). No trailing commas, no pretty-printing, no multi-line values. A log file is valid NDJSON if every line is valid JSON.

Example entry:

```json
{"timestamp":"2026-03-31T14:22:05.123Z","level":"INFO","component":"cli/validator","message":"Validation complete","duration_ms":843,"module_uuid":null}
```

## Log Levels

| Level | When to use |
|---|---|
| `DEBUG` | Per-file timing, rule evaluation traces, internal state transitions. Not written to log files unless debug mode is active. |
| `INFO` | Successful operations: validation pass, index rebuild complete, sync success, agent session start/end. |
| `WARN` | Recoverable issues that do not stop the current operation: `INDEX_STALE` auto-recovered, retry attempt for transient filesystem lock, telemetry transmission skipped. |
| `ERROR` | Failures requiring user attention: any error category from `error-handling/` that is not auto-recovered, unhandled exceptions. |

Do not use `ERROR` for expected failure states that have a defined recovery path. Use `WARN` for those.

## Required Fields

Every log entry, regardless of component or level, must include all of the following:

| Field | Type | Description |
|---|---|---|
| `timestamp` | string | ISO 8601 with millisecond precision and UTC timezone (e.g., `2026-03-31T14:22:05.123Z`) |
| `level` | string | One of: `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `component` | string | Dot-path or slash-path identifier for the emitting component (e.g., `cli/validator`, `gui/file-sync`, `agent-orchestration`) |
| `message` | string | Human-readable description of the event. Must be a static string — do not interpolate variable values into the message; put variables in optional fields instead. |

The `message` field must be stable across versions for the same event type. Tooling may key on message strings for filtering and alerting.

## Optional Fields

Include only when applicable to the event being logged:

| Field | Type | Description |
|---|---|---|
| `module_uuid` | string | UUID of the module being acted on (from its README.md frontmatter) |
| `file_path` | string | Absolute path to the file involved in the operation |
| `error_category` | string | One of the categories defined in `error-handling/`: `VALIDATION_ERROR`, `PARSE_ERROR`, `BROKEN_LINK`, `INDEX_STALE`, `SYNC_FAILURE`, `FILESYSTEM_ERROR` |
| `duration_ms` | number | Elapsed time in milliseconds for timed operations |
| `agent_session_id` | string | UUID of the current agent session; must be present on every entry written during an agent run |

When an `ERROR`-level entry is written, `error_category` is required (not optional). If the error does not map to a defined category, use a descriptive string and file an issue.
