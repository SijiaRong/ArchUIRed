---
name: Telemetry Test Playbook
description: "Test playbook for verifying telemetry opt-in/opt-out behavior, what data is and is not transmitted, and that transmission failures are silent."
---

## Playbook

[init] ArchUI is freshly installed. The user has not yet been prompted about telemetry. Telemetry is off by default.

[action] Run `archui config --telemetry-status`.
[eval] Output indicates telemetry is currently disabled. No telemetry data has been transmitted.

[action] Run `archui config --telemetry on`.
[eval] Telemetry is enabled. `archui config --telemetry-status` now shows enabled.

[action] Run `archui validate` on a small project (5 modules).
[eval] No telemetry is transmitted immediately. The telemetry batch accumulates the event (module count, validation error rate).

[action] Advance time past the 24-hour transmission window. Trigger a telemetry flush.
[eval] A single batched request is transmitted. The payload contains module count and validation stats. It does not contain any file paths, module names, descriptions, or agent log content.

[end] Telemetry status remains enabled. One transmission occurred within the 24-hour window.

---

[init] Telemetry is enabled. The telemetry endpoint is unreachable (network offline).

[action] Run `archui validate`. The telemetry flush is attempted and fails.
[eval] No user-visible error is shown. No retry is attempted. A single `WARN`-level log entry notes that telemetry transmission was skipped. The CLI exits normally.

[end] Telemetry data is discarded silently. No crash, no error output to the user.

---

[init] Telemetry is enabled.

[action] Run `archui config --telemetry off`.
[eval] Telemetry is disabled. `archui config --telemetry-status` confirms disabled.

[action] Run `archui validate` and advance past 24 hours.
[eval] No telemetry is transmitted. The batch that was accumulating is discarded.

[end] No transmission occurs after opt-out.
