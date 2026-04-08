---
name: Release Calendar Test Playbook
description: "Playbook for verifying release cadence rules, hotfix scope classification, coordinated release procedures, and the append-only release history record."
---

## Playbook

### Group 1: Default Cadence Compliance

[init] A valid ArchUI project exists. All platforms last released 9 weeks ago. No user-facing changes are ready for any platform.

[action] A platform release agent checks whether the minimum cadence of one release per 8 weeks has been met.
[eval] The check fails — 9 weeks have elapsed since the last release, exceeding the 8-week maximum interval. The platform must release.

[action] The platform release agent creates a maintenance patch release (dependency updates, telemetry cleanup) to satisfy the cadence requirement.
[eval] A patch release tag is created. The cadence requirement is satisfied even though no user-facing features were included.

[action] Inspect the release history record to confirm the maintenance release was appended.
[eval] release-coordination/resources/release-history.yaml contains a new entry with type: patch, the correct platform, date, and version. The previous entries are unmodified.

[end] Confirm the release history file was appended and not rewritten. Confirm archui validate passes.

### Group 2: Hotfix Scope Classification

[init] A valid ArchUI project exists. A crash has been reported that affects only the iOS client (a platform-specific rendering bug).

[action] The iOS release agent creates a hotfix branch from the relevant iOS platform tag and applies the fix.
[eval] The hotfix branch is named hotfix/ios-v<X>.<Y>.<patch+1>. Only iOS files are modified. No other platform receives a release.

[action] The iOS release agent tags the hotfix, submits for App Store review, and appends to the release history.
[eval] The new tag ios/v1.4.1 (or current patch+1) exists. The release history entry shows type: hotfix. Android and Web are unaffected.

[action] A different bug is found that originates in a core/ module's shared logic, affecting all platforms.
[eval] The architect agent opens a coordination issue. All platforms must ship a PATCH release. This is treated as a core bug, not a platform-specific hotfix.

[end] Verify only iOS was released in the platform-specific scenario. Verify all platforms have a release obligation in the core-bug scenario.

### Group 3: Release History Record Integrity

[init] A valid ArchUI project exists. The release history file release-coordination/resources/release-history.yaml exists with several existing entries.

[action] A platform release agent appends a new release entry to the file following the required YAML structure.
[eval] The new entry includes all required fields: tag, date, platform, version, type, schema_version, summary, and coordinated_release. Existing entries are unmodified.

[action] Two platforms tag releases on the same day and both append to the release history simultaneously, causing a conflict.
[eval] The conflict is resolved by merging both entries in chronological order. Neither entry is lost. The file remains valid YAML after the merge.

[action] An agent attempts to rewrite an existing release history entry to correct a typo.
[eval] This violates the append-only rule. The agent must not rewrite existing entries. A corrective annotation may be appended as a new entry if needed.

[end] Confirm the release history file is valid YAML and contains all entries in append order. Confirm archui validate passes.

### Group 4: Schema-Sync Release Window

[init] A valid ArchUI project exists. schema/v2 was just created. iOS and Android have shipped their 2.0.0 releases. Web/Electron has not.

[action] The architect agent checks whether all platforms have shipped their vX.0.0 releases following schema/v2.
[eval] iOS and Android are confirmed on 2.0.0+. Web/Electron still has a pending MAJOR bump obligation.

[action] The architect agent attempts to create schema/v3 before Web/Electron has shipped 2.0.0.
[eval] This is not permitted — schema/v3 may not be created until all platforms have tagged their v2.0.0 releases. The architect agent must wait.

[action] Web/Electron is blocked for more than 6 weeks due to an App Store review delay.
[eval] The 6-week maximum window has been exceeded. The architect agent must escalate to a coordination review before any further schema progression is permitted.

[end] Verify no schema/v3 tag was created before all platforms reached 2.0.0. Confirm the coordination review escalation process was initiated.
