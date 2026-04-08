---
name: Hotfix Policy
description: Decision table and procedures for hotfixes — when a fix is isolated to one platform versus when all platforms must patch.
---

## Decision Table

| Root cause | Scope | Action |
|---|---|---|
| Platform-specific bug (iOS crash, Android ANR, web rendering regression, Electron IPC failure) | Single platform | PATCH hotfix on the affected platform only. No other platform releases. |
| Bug in `core` module schema or shared logic | All platforms | All platforms must ship a PATCH release. The architect agent opens a coordination issue; each platform release agent targets its next available release slot. |
| Security vulnerability in a shared dependency | Platform-dependent | Assess per-platform exposure. If exposure exists on multiple platforms, treat as a `core` bug and require all affected platforms to patch. |

## Procedure for Platform-Specific Hotfixes

For platform-specific hotfixes, the releasing agent:

1. Creates a hotfix branch from the relevant platform tag:
   ```sh
   git checkout -b hotfix/ios-v1.4.1 ios/v1.4.0
   ```
2. Applies the fix.
3. Tags `<platform>/v<patch+1>`.
4. Submits for store review.
5. Appends to `release-coordination/resources/release-history.yaml` (see `release-history/`).
