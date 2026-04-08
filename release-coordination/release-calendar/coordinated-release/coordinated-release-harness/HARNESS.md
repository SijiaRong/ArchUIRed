---
name: Coordinated Release Test Playbook
description: "Test playbook for verifying the coordinated release procedure — file creation, gate updates, release sequencing, and archival."
---

## Playbook

[init] A new cross-platform feature "dark-mode" is ready to ship. No coordinated release file exists yet. All platforms are at version 1.3.x.

[action] The architect agent creates `release-coordination/resources/coordinated-release-dark-mode.yaml` with target versions and readiness gates for all four platforms.
[eval] The file is valid YAML matching the coordinated-release schema. All readiness gates are in the uncleared state. The target_date is set to a future date.

[action] The iOS release agent clears its two readiness gates (QA sign-off and App Store review submitted) and updates the file.
[eval] iOS readiness gates are marked cleared. Android, Web, and Electron gates remain open. No platform has tagged a release yet.

[action] Android, Web, and Electron agents clear their respective gates over the next two days.
[eval] All readiness gates across all platforms are cleared. The file reflects the updated state.

[action] Each platform tags its release: `ios/v1.4.0`, `android/v1.4.0`, `web/v1.4.0`, `electron/v1.4.0`. The tags are created within the same business day.
[eval] All four platforms have shipped. The coordinated release is complete. Each release appends an entry to `release-history.yaml` with `coordinated_release: dark-mode`.

[action] The architect agent moves `coordinated-release-dark-mode.yaml` to `release-coordination/resources/archive/`.
[eval] The file is no longer in the active resources directory. The archive contains the completed coordination record.

[end] The coordinated release is fully closed out. No coordination files remain in the active resources directory.
