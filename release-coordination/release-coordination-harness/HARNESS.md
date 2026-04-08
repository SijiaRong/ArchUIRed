---
name: Release Coordination Test Playbook
description: "Playbook for verifying cross-platform release coordination rules, MAJOR synchronization enforcement, and the independence-by-default principle."
---

## Playbook

### Group 1: Independence by Default

[init] A valid ArchUI project exists. All platforms are at MAJOR version 1. No schema change is in flight. iOS is at 1.4.0, Android at 1.2.1, Web at 1.3.0.

[action] The iOS platform release agent tags a new minor release ios/v1.5.0 without waiting for Android or Web to release.
[eval] The tag is created successfully. No coordination violation is flagged. Android and Web remain at their current versions.

[action] The Android platform release agent tags android/v1.2.2 as a patch release on its own schedule.
[eval] The tag is created successfully. All three platforms now have different MINOR and PATCH versions, which is the expected healthy state.

[action] Run the version-state inspection commands across all platform namespaces.
[eval] Each platform shows its own latest tag. All share MAJOR version 1. No coordination alert is triggered.

[end] No filesystem changes are required; tags remain as created.

### Group 2: MAJOR Synchronization Enforcement

[init] A valid ArchUI project exists at schema/v1. All platforms are at vX.y.z where X=1. A breaking schema change has been merged to core/.

[action] The architect agent creates the schema/v2 tag after merging all core module changes for the new schema generation.
[eval] The tag schema/v2 exists in the repository. No platform has yet shipped a v2.0.0 release.

[action] A platform release agent attempts to create ios/v2.0.0 without a corresponding schema/v2 tag existing.
[eval] This action would constitute a coordination violation — a platform MAJOR bump without a schema basis. The agent must not proceed; the schema tag must exist first.

[action] Each platform release agent detects schema/v2 and schedules a MAJOR bump as the first version number change in their next release.
[eval] All three platform agents have recorded in their next release plan that a MAJOR bump to 2.0.0 is required. No platform ships MINOR or PATCH increments that would skip the MAJOR bump obligation.

[action] All three platforms ship their X.0.0 releases.
[eval] ios/v2.0.0, android/v2.0.0, and web/v2.0.0 (or electron/v2.0.0) tags exist. The synchronization window closes. Normal independent cadence resumes.

[end] Verify all platform tags reflect the new MAJOR. Verify archui validate passes.

### Group 3: Coordinated Release

[init] A valid ArchUI project exists. A significant cross-platform feature is ready to ship simultaneously across all platforms.

[action] A release coordinator creates release-coordination/resources/coordinated-release-<feature-name>.yaml with target versions and readiness gates for all platforms.
[eval] The YAML file exists in resources/ with the required structure: name, target_date, per-platform target_version and readiness_gates, and optional notes.

[action] Each platform release agent updates its readiness_gates status in the file as gates are cleared.
[eval] The file is updated incrementally; no agent overwrites another platform's section.

[action] All gates are cleared across all platforms on the same business day. Each platform proceeds to tag and release on its own pipeline.
[eval] Each platform's release tag is created. Exact simultaneity is not required — all tags appear within the same coordinated release window.

[action] After all platforms have shipped, the coordinated release file is moved to release-coordination/resources/archive/.
[eval] The original file no longer exists in resources/. The archived file is present in resources/archive/. archui validate passes.

[end] Confirm resources/coordinated-release-<feature-name>.yaml does not exist outside archive/. Confirm archui validate passes.
