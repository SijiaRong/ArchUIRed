---
name: Hotfix Policy Test Playbook
description: Test playbook for verifying correct hotfix scope decisions — platform-isolated versus all-platform — and the branching and tagging procedure.
---

## Playbook

[init] All platforms are at version 1.4.0. An iOS-specific crash bug is reported. No other platform is affected.

[action] The iOS release agent creates a hotfix branch from `ios/v1.4.0` and applies the fix.
[eval] The hotfix branch is named `hotfix/ios-v1.4.1` and branches from the `ios/v1.4.0` tag. No changes are made to Android, Web, or Electron.

[action] The iOS agent tags `ios/v1.4.1` and submits for App Store review.
[eval] Only `ios/v1.4.1` is created. Android remains at `android/v1.4.0`. Web and Electron are unchanged. An entry is appended to `release-history.yaml` with `type: hotfix` and `platform: ios`.

[end] Platform-specific hotfix is complete. Only iOS shipped. No other platform was required to release.

---

[init] All platforms are at version 1.4.0. A bug is found in a `core` module schema that causes incorrect validation behavior on all platforms.

[action] The architect agent identifies the bug as a `core` schema issue and opens a coordination issue naming all four platforms.
[eval] Each platform release agent is notified. All four are obligated to ship a PATCH release.

[action] Each platform ships its hotfix independently on its own schedule: iOS ships `ios/v1.4.1`, Android ships `android/v1.4.1`, Web ships `web/v1.4.1`, Electron ships `electron/v1.4.1`.
[eval] All four platforms have patched the bug. Each appends an entry to `release-history.yaml`.

[end] All platforms are at version 1.4.1. The core schema bug is resolved across all platforms.

---

[init] A security vulnerability is discovered in a shared dependency. Initial assessment is unclear about platform exposure.

[action] Each platform agent assesses whether its build includes the vulnerable dependency version.
[eval] iOS and Android are affected. Web and Electron use a newer version of the dependency and are not affected.

[action] The affected platforms (iOS and Android) are treated as a `core` bug scope. Both ship hotfix patches.
[eval] `ios/v1.4.1` and `android/v1.4.1` are tagged. Web and Electron are not required to release.

[end] The vulnerability is patched on all affected platforms. Unaffected platforms are not disturbed.
