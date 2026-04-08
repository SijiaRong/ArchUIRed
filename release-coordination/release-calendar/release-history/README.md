---
name: Release History
description: "Format and append-only rules for release-coordination/resources/release-history.yaml, the shared log that records every platform release tag."
---

## Overview

Every time a platform tags a release, the releasing agent appends an entry to `release-coordination/resources/release-history.yaml`. This file is the shared coordination log that gives all agents a current view of where each platform stands.

## Entry Format

```yaml
releases:
  - tag: ios/v1.4.0
    date: YYYY-MM-DD
    platform: ios
    version: 1.4.0
    type: minor          # major | minor | patch | hotfix
    schema_version: 1    # MAJOR component of the schema/vX tag current at release time
    summary: >
      One-sentence description of what shipped.
    coordinated_release: null   # or the name from coordinated-release-<name>.yaml if applicable
```

## Rules

**Append-only.** Agents append entries; they never rewrite or delete existing entries.

**Required after every release.** Every `<platform>/v*` tag must have a corresponding entry here. A tag without a history entry is an incomplete release.

**Conflict resolution.** If two platforms tag on the same day and a git merge conflict arises on the append, resolve by merging both entries in chronological order.
