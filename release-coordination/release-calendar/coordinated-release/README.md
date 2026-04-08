---
name: Coordinated Release
description: "Optional procedure for shipping a cross-platform feature simultaneously, including the coordination YAML format, readiness gates, and archival process."
---

## Overview

When a significant cross-platform feature ships simultaneously, a coordinated release can be planned. This is optional — platforms can also ship features independently. A coordinated release does not mean exact-minute simultaneous deployment; it means within the same release window (typically a single business day).

## Initiating a Coordinated Release

1. Create a file at `release-coordination/resources/coordinated-release-<feature-name>.yaml`:

```yaml
name: <feature-name>
target_date: YYYY-MM-DD          # aspirational; not a hard deadline
platforms:
  ios:
    target_version: 1.5.0
    readiness_gates:
      - QA sign-off on feature branch
      - App Store review submitted
  android:
    target_version: 1.3.0
    readiness_gates:
      - QA sign-off on feature branch
      - Play review submitted
  web:
    target_version: 1.4.0
    readiness_gates:
      - Staging smoke test passed
  electron:
    target_version: 1.4.0
    readiness_gates:
      - Notarization verified
notes: |
  Optional free-text context about the coordination goals.
```

2. Each platform release agent updates its `readiness_gates` status in the file as gates are cleared.
3. When all gates are cleared, each platform proceeds to tag and release on its own pipeline. Exact simultaneity is not required — "coordinated" means within the same release window, not the same CI minute.
4. After all platforms have shipped, archive the file by moving it to `release-coordination/resources/archive/`.
