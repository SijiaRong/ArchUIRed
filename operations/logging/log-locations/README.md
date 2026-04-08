---
name: Log Locations
description: "Log file paths per component (CLI, GUI, agent runs) and instructions for enabling debug-level logging."
---

## Log File Locations

**CLI**
- Real-time output: stderr (human-readable format, not NDJSON)
- Persistent log: `~/.archui/logs/cli-<date>.ndjson` where `<date>` is `YYYY-MM-DD` in local time

**GUI**
- OS-native app log directory (e.g., `~/Library/Logs/ArchUI/` on macOS, `~/.local/share/archui/logs/` on Linux)
- Mirror: `~/.archui/logs/gui-<date>.ndjson`

**Agent runs**
- `~/.archui/logs/agent-<session-id>.ndjson` where `<session-id>` is the UUID generated at session start
- Agent log files are not date-rotated; they persist until the 30-day global rotation policy (see `log-rotation/`) removes them

All components share the `~/.archui/logs/` directory. Components must create this directory (with `mkdir -p` semantics) on first write if it does not exist.

## Enabling Debug Logging

To activate `DEBUG`-level entries for a CLI run:

```sh
# Via flag (applies to this invocation only)
archui validate --log-level debug

# Via environment variable (applies to all commands in the shell session)
export ARCHUI_LOG_LEVEL=debug
archui validate
```

Debug mode adds the following to the log output:
- Per-file timing (`duration_ms` on each file processed)
- Rule evaluation traces (one `DEBUG` entry per rule checked, with the rule name and pass/fail result)
- YAML parser internals (keys found, type coercions applied)

Debug log files can grow large quickly on projects with many modules. The 50 MB rotation policy (see `log-rotation/`) applies.

To debug a specific agent run, ensure `ARCHUI_LOG_LEVEL=debug` is set before the agent session starts, then inspect `~/.archui/logs/agent-<session-id>.ndjson` after the run completes. Filter by `agent_session_id` to isolate entries from a single session:

```sh
jq 'select(.agent_session_id == "<session-id>")' ~/.archui/logs/agent-<session-id>.ndjson
```
