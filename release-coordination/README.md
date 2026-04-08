---
name: Release Coordination
description: "Coordinates releases across iOS, Android, and Web/Electron platforms, defining when they may diverge on minor/patch versions and when a MAJOR schema change forces all platforms to synchronize."
---

## Overview

ArchUI ships on three platforms — iOS, Android, and Web/Electron — each with its own release cadence and review pipeline. This module is the authoritative source for how those releases relate to one another: when platforms are free to release independently, and when a schema-level change requires all platforms to move together.

The central rule is simple: **platforms share a MAJOR version but own their minor and patch versions.** A MAJOR bump is a breaking change to the ArchUI module schema or filesystem format; it is the only event that creates a hard synchronization requirement across all platforms.

## Details

### Independence by default

Under normal circumstances each platform releases on its own schedule. iOS may be at `1.4.0`, Android at `1.2.1`, and web at `1.3.0` simultaneously — this is expected and healthy. No platform waits for another unless a MAJOR schema change is in flight.

### MAJOR synchronization

When a breaking change to the ArchUI module schema or filesystem format is planned, the following sequence is enforced:

1. The architect agent updates the affected `core` modules.
2. A `schema/vX` tag is created in the repository to mark the new schema generation.
3. Each platform release agent detects the new schema tag and schedules a MAJOR bump as the first version number change in their next release.
4. **No platform may ship a MAJOR bump without a corresponding `schema/vX` tag.** An independent MAJOR bump is a coordination violation.

Once all platforms have released their `X.0.0` builds the synchronization window closes and normal independent cadence resumes.

### Authority scope

This module owns:
- The definition of what constitutes a MAJOR vs. minor/patch change in the ArchUI context.
- The tag naming convention that makes platform versions machine-readable (`<platform>/v<semver>`, `schema/v<major>`).
- The hotfix policy determining whether a fix must propagate to other platforms or can be isolated.
- The release history record kept in `resources/release-history.yaml`.

Platform-specific release mechanics (build signing, store submission, rollout percentages) are owned by each platform's release submodule.
