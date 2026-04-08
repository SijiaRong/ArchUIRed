---
name: Versioning Strategy
description: "Documents the cross-platform versioning contract: all platforms share a common MAJOR version tied to schema generations, while MINOR and PATCH versions are owned independently by each platform."
---

## Overview

ArchUI uses a structured semver contract that balances platform autonomy with schema integrity. The contract has one hard constraint (shared MAJOR) and one permissive default (independent MINOR and PATCH). Everything else — cadence, hotfix timing, coordinated launches — is advisory.

## Details

### Semver roles in the ArchUI context

| Version component | Meaning | Who controls it |
|---|---|---|
| MAJOR | Breaking change to ArchUI module schema or filesystem format | Schema tag; all platforms must adopt together |
| MINOR | New features or non-breaking additions within a platform | Each platform independently |
| PATCH | Bug fixes, hotfixes, and non-functional changes | Each platform independently |

A "breaking change to the module schema" means any of the following: a required frontmatter field is added, removed, or renamed; the filesystem layout contract changes (e.g., `resources/` is no longer the only permitted non-module subfolder); or the UUID format changes. Changes that are additive and backward-compatible (a new optional field, a new allowed relation type) are MINOR at most.

### Git tag format

Every release is recorded with a git tag. The naming convention is:

```
<platform>/v<major>.<minor>.<patch>
```

Examples:
- `ios/v1.4.0` — iOS minor release
- `android/v1.2.1` — Android patch release
- `web/v1.3.0` — Web minor release
- `electron/v1.3.0` — Electron minor release (tagged separately from web when Electron ships on a different schedule)

Schema-generation tags use a separate namespace:

```
schema/v<major>
```

Examples: `schema/v1`, `schema/v2`. These tags are created by the architect agent, not by platform release agents.

### MAJOR version lifecycle

The sequence for a MAJOR version change is strictly ordered:

1. **Schema tag created.** The architect agent creates `schema/vX` after merging all `core` module changes for the new generation. This tag is the canonical signal that a new MAJOR is available.
2. **Platforms acknowledge.** Each platform release agent reads the schema tag and records in their next release plan that a MAJOR bump is required.
3. **Platform tags created.** Each platform tags `<platform>/vX.0.0` in their next release. The releases do not have to happen on the same day — the shared MAJOR version is the contract, not simultaneous shipping.
4. **Window closes.** Once all platforms are on `X.0.0` or higher, the coordination window is closed.

**Constraint:** a platform release agent must never create a `<platform>/v(X+1).y.z` tag unless `schema/v(X+1)` already exists. Doing so creates a phantom MAJOR that has no schema basis and will break coordination tooling.

### Reading the current version state

To determine the current cross-platform version state, inspect the most recent tag per namespace:

```
git tag --list 'ios/v*'     | sort -V | tail -1
git tag --list 'android/v*' | sort -V | tail -1
git tag --list 'web/v*'     | sort -V | tail -1
git tag --list 'electron/v*'| sort -V | tail -1
git tag --list 'schema/v*'  | sort -V | tail -1
```

If any platform's MAJOR lags behind the latest `schema/vX` tag, that platform has a pending MAJOR bump obligation.

### Pre-release and build metadata

Pre-release suffixes follow standard semver: `ios/v2.0.0-beta.1`. Build metadata may be appended for CI traceability: `ios/v1.4.0+build.2041`. Build metadata is ignored when comparing versions for coordination purposes.
