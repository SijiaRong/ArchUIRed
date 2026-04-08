---
name: Log Schema Test Playbook
description: "Test playbook for verifying that all ArchUI components emit log entries conforming to the NDJSON schema — correct format, levels, required fields, and optional field rules."
---

## Playbook

[init] `archui validate` is about to run on a clean project. The log file does not yet exist.

[action] Run `archui validate`. The project is valid and exits 0.
[eval] The log file contains at least one `INFO`-level entry. The entry is valid JSON on a single line. It contains `timestamp` (ISO 8601 with milliseconds and UTC), `level: INFO`, `component: cli/validator`, and `message`. No trailing comma, no multi-line values.

[action] Inspect the `message` field across multiple runs with identical operations.
[eval] The `message` value is identical across runs for the same event type. It does not contain interpolated values (file paths, counts, etc.). Variable data is in separate fields.

[end] All entries in the log file parse as valid NDJSON. Every entry has all four required fields.

---

[init] A validation run encounters a BROKEN_LINK error.

[action] Run `archui validate` on the project with the broken link.
[eval] An `ERROR`-level entry is present. It contains all four required fields plus `error_category: BROKEN_LINK`. The `error_category` field is not absent or null on an ERROR entry.

[action] A recoverable INDEX_STALE condition is auto-resolved during the same run.
[eval] A `WARN`-level entry is present for the auto-recovery. It does not use `ERROR` level, since the condition has a defined recovery path.

[end] The log file contains one WARN and one ERROR entry. The WARN entry has no `error_category` field (optional on WARN).

---

[init] An agent session is running and writing log entries.

[action] The agent touches three modules and the session ends.
[eval] Every log entry written during the session includes `agent_session_id`. The value is identical across all entries for this session. `DEBUG` entries for module touches include `module_uuid`, `file_path`, and `action`.

[end] Filtering the log by `agent_session_id` returns exactly the entries for this session and no others.
