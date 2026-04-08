---
name: Agent Observability
description: "Required structured log events for every ArchUI agent session, including mandatory fields at each lifecycle point and the per-session log file location."
---

## Overview

Every agent run must emit structured log entries at defined lifecycle points. These entries are written to a per-session NDJSON log file and are the primary record for debugging failed or slow agent runs.

## Required Log Events

| Event | Log level | Required fields |
|---|---|---|
| Agent session start | `INFO` | `timestamp`, `agent_session_id`, `component: agent-orchestration` |
| Each module touched (read or written) | `DEBUG` | `module_uuid`, `file_path`, `action` (read/write/skip) |
| Validation result for the session | `INFO` | `validation_result` (pass/fail), `error_category` if fail |
| Agent session end | `INFO` | `duration_ms`, `modules_touched_count` |

## Log File Location

Agent run logs are written to `~/.archui/logs/agent-<session-id>.ndjson`. The session ID is a UUID generated at session start and must be included in every log entry for that session as `agent_session_id`.

Agent log files are not date-rotated; they persist until the 30-day global rotation policy (defined in `logging/log-rotation/`) removes them.

## Filtering Agent Logs

To isolate entries from a single session when multiple sessions overlap in time, filter by `agent_session_id`:

```sh
jq 'select(.agent_session_id == "<session-id>")' ~/.archui/logs/agent-<session-id>.ndjson
```
