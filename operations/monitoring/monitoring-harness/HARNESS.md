---
name: Monitoring Test Playbook
description: "Playbook for verifying that all defined observability checkpoints are reached, performance thresholds are enforced, and telemetry opt-in behavior functions correctly."
---

## Playbook

### Group 1: CLI Performance Checkpoints

[init] A valid ArchUI project exists with fewer than 500 modules. The CLI log level is set to INFO.

[action] Run archui validate and capture the log output.
[eval] The NDJSON log contains an INFO entry with duration_ms for the complete validation run. The run completes in under 2 seconds (target threshold). The entry includes component: cli/validator and message: Validation complete.

[action] Run archui validate with --log-level debug.
[eval] The log contains additional DEBUG entries with per-file timing (duration_ms per file) and rule evaluation traces for each module processed.

[action] Run archui index rebuild and capture the log.
[eval] An INFO entry with duration_ms is present. The rebuild completes in under 1 second. If duration exceeds 2× baseline, a WARN entry is written noting the regression.

[end] No filesystem changes required. Log files at ~/.archui/logs/ contain the timing entries.

### Group 2: Agent Run Observability

[init] A valid ArchUI project exists. An agent session is about to start.

[action] Start an agent session and immediately inspect the log file.
[eval] An INFO entry with event agent session start is present, containing timestamp, agent_session_id, and component: agent-orchestration.

[action] The agent reads two modules and writes to one during the session.
[eval] Three DEBUG entries are written, one per module touched, each containing module_uuid, file_path, and action (read or write). The agent_session_id field matches the session-start entry.

[action] The agent completes and the session ends.
[eval] An INFO entry for validation result is present, showing pass or fail and error_category if applicable. A final INFO entry for agent session end includes duration_ms and modules_touched_count.

[action] Filter the log file by agent_session_id to isolate only entries from this session.
[eval] All and only entries from this session are returned. No entries from other sessions appear.

[end] Terminate the agent session. Log file persists at ~/.archui/logs/agent-<session-id>.ndjson.

### Group 3: GUI Health Signals

[init] A valid ArchUI GUI is open in developer mode with fewer than 50 visible nodes. Performance overlay is visible.

[action] Perform an active pan gesture across the canvas for at least 2 seconds.
[eval] The performance overlay shows frame rate at or above 60 FPS. A DEBUG log entry records the sampled frame rate over the 500 ms measurement window.

[action] Trigger an LLM sync operation on a single changed module file.
[eval] An INFO log entry is written with duration_ms for the full sync operation (dispatch to validated response). If duration exceeds 30 seconds, the below-threshold trigger fires.

[action] Simulate a filesystem change event and measure when the GUI canvas reflects the updated module state.
[eval] The GUI updates within 2 seconds on a local disk. If latency exceeds 2 seconds, it is flagged as anomalous and logged at DEBUG level with the elapsed time.

[end] No filesystem changes required. Close developer mode overlay.

### Group 4: Telemetry Opt-In Behavior

[init] A valid ArchUI installation exists. The user has not yet configured telemetry.

[action] Check telemetry status using archui config --telemetry-status.
[eval] The command reports that telemetry is currently disabled (default off). No data has been transmitted.

[action] Opt in to telemetry using archui config --telemetry on.
[eval] Telemetry is now enabled. The next daily batch will include module count, validation error rate, sync success/failure rate, and CLI/GUI version. No file contents, module names, paths, or user-identifiable information is included.

[action] Simulate a telemetry transmission failure (make the telemetry endpoint unreachable).
[eval] The failure is silently dropped. No user-visible error appears. No retry loop is triggered. A WARN log entry may be written noting the transmission failure, but no user notification occurs.

[action] Opt out of telemetry using archui config --telemetry off.
[eval] Telemetry is disabled. archui config --telemetry-status confirms opt-out. No further transmissions occur.

[end] Restore telemetry configuration to the pre-test state. No filesystem changes to module files required.
