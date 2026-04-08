---
name: Versioning Strategy Test Playbook
description: "Playbook for verifying that the cross-platform versioning contract is correctly enforced, including MAJOR/MINOR/PATCH role assignments, git tag format, and the MAJOR version lifecycle sequence."
---

## Playbook

### Group 1: Semver Role Assignments

[init] A valid ArchUI project exists at schema/v1. All platforms are at 1.x.y. No breaking schema change is planned.

[action] The iOS team ships a new feature that adds a non-breaking capability to the iOS client.
[eval] The release agent creates ios/v1.5.0 (a MINOR bump). No MAJOR bump is required because the change is non-breaking and no schema/v2 tag exists.

[action] The Android team ships a bug fix with no feature changes.
[eval] The release agent creates android/v1.2.2 (a PATCH bump). The MAJOR and MINOR components remain unchanged.

[action] A required frontmatter field is added to the ArchUI module schema (a breaking change). The architect agent creates schema/v2.
[eval] The schema/v2 tag is created. All platforms must now schedule a MAJOR bump. No platform may ship a MINOR or PATCH that would land on the current MAJOR without first shipping their X.0.0.

[end] Verify platform tags follow the expected semver role assignments. No filesystem changes required.

### Group 2: Git Tag Format

[init] A valid ArchUI project exists. Platform release agents are ready to tag new releases.

[action] The iOS release agent creates a tag for a minor release.
[eval] The tag matches the format ios/v<major>.<minor>.<patch> exactly — for example, ios/v1.4.0. No deviations from this format are accepted.

[action] The Android release agent creates a pre-release tag for a beta build.
[eval] The tag matches android/v2.0.0-beta.1 using the standard semver pre-release suffix. The tag is valid.

[action] The Web release agent appends build metadata to a tag.
[eval] The tag matches web/v1.3.0+build.2041. The build metadata suffix after the + is present and valid for CI traceability. This tag is treated as equivalent to web/v1.3.0 for coordination comparisons.

[action] A platform release agent creates a schema-generation tag.
[eval] The tag matches schema/v<major> — for example, schema/v2. The architect agent, not a platform release agent, must be the creator of this tag.

[end] Verify all tags exist with the correct format. No filesystem changes required.

### Group 3: MAJOR Version Lifecycle Sequence

[init] A valid ArchUI project exists. schema/v2 has just been created. All platforms are still on 1.x.y.

[action] A platform release agent reads the latest schema tag and confirms schema/v2 exists.
[eval] The agent finds schema/v2 and records in its next release plan that a MAJOR bump to 2.0.0 is required.

[action] The iOS release agent attempts to tag ios/v2.0.0 before schema/v2 exists (re-testing the precondition check).
[eval] The tag must not be created — a platform MAJOR bump without a corresponding schema tag is a coordination violation. The agent blocks on this check.

[action] Once schema/v2 is confirmed, all three platform release agents tag their 2.0.0 releases over the course of a few days.
[eval] ios/v2.0.0, android/v2.0.0, web/v2.0.0, and electron/v2.0.0 all exist. The releases do not need to happen simultaneously — shared MAJOR is the contract, not same-day shipping.

[action] After all platforms are on 2.0.0+, inspect the version state using the tag-listing commands.
[eval] Each platform's latest tag shows MAJOR=2. No platform still has a pending MAJOR bump obligation. The coordination window is confirmed closed.

[end] Verify all platform tags are at MAJOR=2. No filesystem changes required.

### Group 4: Phantom MAJOR Prevention

[init] A valid ArchUI project exists at schema/v1. No schema/v2 tag exists.

[action] A platform release agent attempts to create ios/v2.0.0 to introduce a "major feature release."
[eval] archui validation or release tooling must reject this tag because schema/v2 does not yet exist. A platform may not create a MAJOR=2 tag when the schema has not advanced to v2.

[action] The architect agent creates schema/v2 to legitimize the MAJOR bump.
[eval] Once schema/v2 exists, the platform release agent may now create ios/v2.0.0 legally.

[end] Verify ios/v2.0.0 can only be created after schema/v2 exists. No filesystem changes required beyond the tag creation.
