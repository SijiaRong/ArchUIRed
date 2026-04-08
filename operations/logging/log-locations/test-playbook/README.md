---
name: Log Locations Test Playbook
description: "Test playbook for verifying that CLI, GUI, and agent logs are written to the correct file paths and that debug mode produces the expected additional output."
---

## Playbook

[init] ArchUI is freshly installed. `~/.archui/logs/` does not exist.

[action] Run `archui validate` for the first time.
[eval] `~/.archui/logs/` is created automatically (mkdir -p semantics). A log file named `cli-<today-date>.ndjson` exists in that directory after the run. No error occurs due to the missing directory.

[action] Run `archui validate` again on the same day.
[eval] Entries are appended to the existing `cli-<today-date>.ndjson` file. A new file is not created.

[end] `~/.archui/logs/cli-<today-date>.ndjson` contains entries from both runs. No duplicate files exist.

---

[init] The GUI is launched on macOS. `~/.archui/logs/` exists.

[action] The GUI starts up and performs a canvas load.
[eval] A log file exists at `~/Library/Logs/ArchUI/gui-<today-date>.ndjson` (macOS native path). A mirror also exists at `~/.archui/logs/gui-<today-date>.ndjson`. Both files contain the same entries.

[end] GUI log is written to both locations. Neither file is missing.

---

[init] An agent session is starting. `ARCHUI_LOG_LEVEL=info` is set.

[action] The agent session runs and completes.
[eval] A file `~/.archui/logs/agent-<session-id>.ndjson` exists. The session-id in the filename matches the `agent_session_id` field in every entry within the file.

[end] The agent log file is correctly named and scoped to this session.

---

[init] `ARCHUI_LOG_LEVEL=debug` is set. A project with 10 modules is ready.

[action] Run `archui validate --log-level debug`.
[eval] The log file contains `DEBUG`-level entries with per-file `duration_ms` values. One DEBUG entry per file is present. YAML parser internals entries are present. Rule evaluation traces are present.

[action] Run the same command without `--log-level debug`.
[eval] No DEBUG entries appear in the log. Only INFO (and WARN/ERROR if applicable) entries are present.

[end] Debug mode is confirmed additive — it adds DEBUG entries without removing INFO entries.
