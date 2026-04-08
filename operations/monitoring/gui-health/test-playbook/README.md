---
name: GUI Health Test Playbook
description: "Test playbook for verifying that GUI health signals are measured, logged, and flagged correctly under normal and degraded conditions."
---

## Playbook

[init] The GUI is running in developer mode with a canvas open showing 40 visible module nodes. Debug-level logging is active. No pan or zoom gesture is in progress.

[action] Begin a continuous pan gesture across the canvas lasting 3 seconds.
[eval] The GUI log contains `DEBUG`-level entries with `duration_ms` values reflecting render loop tick rate sampled over each 500 ms window. All sampled FPS values are ≥ 60.

[action] Simulate a degraded render path that drops frame rate to 25 FPS while still showing ≤ 50 visible nodes.
[eval] A `WARN`-level log entry is emitted. The performance overlay in developer mode reflects the below-threshold FPS value.

[end] Stop the gesture. FPS returns to ≥ 60. No further WARN entries are emitted.

---

[init] The GUI has dispatched an LLM sync request via `gui/file-sync`. The request is for a single-file change. The clock starts at dispatch time.

[action] The LLM API responds within 10 seconds with a valid patch.
[eval] An `INFO`-level entry is logged with `duration_ms` ≤ 10000. No WARN or ERROR entries are emitted.

[action] Simulate the LLM API taking 35 seconds to respond.
[eval] An entry is logged with `duration_ms` > 30000. The monitoring threshold for LLM sync latency is breached; the log entry is sufficient to trigger a CI threshold failure if run in benchmark mode.

[end] Sync completes. Canvas reflects the updated module state.

---

[init] The GUI is running with its filesystem watcher active on a local disk. A module README.md is about to be modified externally.

[action] Write a change to a module README.md using an external editor. The change completes within 200 ms.
[eval] The canvas re-renders to reflect the updated module within 200 ms. A `DEBUG` entry is logged with the filesystem watch latency.

[action] Simulate a watcher delay that causes canvas update to lag 3 seconds after the file change.
[eval] A `WARN` entry is emitted noting that filesystem watch latency exceeded 2 seconds. The canvas eventually updates.

[end] Watcher resumes normal latency. No further WARN entries.
