---
name: Agent Observability Test Playbook
description: Test playbook for verifying that agent sessions emit all required structured log events at the correct lifecycle points.
---

## Playbook

[init] A new agent session is about to start. `ARCHUI_LOG_LEVEL=info` is set. The log directory `~/.archui/logs/` exists. No prior agent log file for this session exists.

[action] Start the agent session. The agent initializes and begins work.
[eval] A log file `~/.archui/logs/agent-<session-id>.ndjson` is created. The first entry is `INFO`-level with fields `timestamp`, `agent_session_id`, and `component: agent-orchestration`.

[action] The agent reads two modules and writes one module during its task.
[eval] Three `DEBUG`-level entries are present, one per module touched, each with `module_uuid`, `file_path`, and `action` (two `read`, one `write`). All entries include `agent_session_id` matching the session-start entry.

[action] The agent runs `archui validate` at the end of its session. Validation passes.
[eval] An `INFO`-level entry is present with `validation_result: pass`. No `error_category` field is present on this entry.

[action] The agent session ends cleanly.
[eval] An `INFO`-level session-end entry is present with `duration_ms` and `modules_touched_count: 3`.

[end] The log file contains exactly: one session-start entry, three module-touch entries, one validation-result entry, one session-end entry. All entries share the same `agent_session_id`.

---

[init] An agent session runs and the final validation fails with a BROKEN_LINK error.

[action] The agent session ends after the failed validation.
[eval] The validation-result log entry is `INFO`-level with `validation_result: fail` and `error_category: BROKEN_LINK`. A session-end entry follows with `duration_ms` populated.

[end] Log file is closed. The error is surfaced through the log; the agent did not suppress it.
