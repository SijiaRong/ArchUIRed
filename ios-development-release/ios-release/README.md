---
name: iOS Release
description: "Defines the complete iOS release workflow — versioning, code signing, TestFlight distribution, App Store submission, and how to trigger an automated release agent run."
---

## Overview

This module documents every step required to ship a new version of ArchUI for iOS — from bumping the version number through App Store Connect approval. It also defines how to trigger a **release agent run**, which automates the mechanical steps so a human only needs to review and approve.

---

## Pre-Build Validation

Before starting any release build or deployment, run the ArchUI CLI validator to confirm the module tree is structurally valid:

```bash
archui validate .
```

If validation reports any `ERROR`, resolve all issues before proceeding. Never archive or submit a build against an invalid module tree.

## Versioning

ArchUI iOS follows **semantic versioning** encoded in two Xcode fields:

| Field | Meaning | Example |
|---|---|---|
| `CFBundleShortVersionString` (Marketing Version) | `MAJOR.MINOR.PATCH` — user-visible | `1.4.0` |
| `CFBundleVersion` (Build Number) | Monotonically increasing integer, never reset | `142` |

**Rules:**
- `PATCH` bump: bug fixes and minor polish with no new features.
- `MINOR` bump: new canvas features, new module types, or design-system updates visible to the user.
- `MAJOR` bump: architectural changes that alter the ArchUI module schema or break existing filesystem layouts.
- Build number increments on every CI build, including TestFlight-only builds.

Update both values in `ArchUI.xcodeproj/project.pbxproj`. Do not maintain a separate `Version.swift` constant — read the bundle version at runtime via `Bundle.main.infoDictionary`.

---

## Code Signing & Provisioning

Signing uses **automatic signing** in Xcode with the `ArchUI Development` and `ArchUI Distribution` signing identities stored in the team's Apple Developer account.

**Certificate types:**

- Development: used for local device installs and simulator builds.
- Distribution (App Store): used for TestFlight and App Store archive builds.

**Provisioning profiles** are managed via Xcode's "Automatically manage signing" — do not commit `.mobileprovision` files to the repo.

**Entitlements** (`ArchUI.entitlements`):
- `com.apple.security.files.user-selected.read-write` — needed for the filesystem browser to open an ArchUI root outside the sandbox.
- `com.apple.developer.icloud-container-identifiers` — for optional iCloud sync of the module tree.

Rotate certificates annually (calendar reminder in the team shared calendar: "Rotate ArchUI iOS Dist Cert"). After rotation, re-download the new distribution certificate and re-archive.

---

## Building a Release Archive

```bash
# Clean build folder first
xcodebuild clean -project ArchUI.xcodeproj -scheme ArchUI -configuration Release

# Archive
xcodebuild archive \
  -project ArchUI.xcodeproj \
  -scheme ArchUI \
  -configuration Release \
  -archivePath ./build/ArchUI.xcarchive \
  -destination "generic/platform=iOS"
```

Export the `.ipa` for App Store upload:

```bash
xcodebuild -exportArchive \
  -archivePath ./build/ArchUI.xcarchive \
  -exportPath ./build/ArchUI-AppStore \
  -exportOptionsPlist ExportOptions-AppStore.plist
```

`ExportOptions-AppStore.plist` is committed to the repo at the project root. It sets `method=app-store`, `teamID`, and `uploadBitcode=false`.

---

## TestFlight Distribution

1. Upload the exported `.ipa` using `xcrun altool` or Transporter.
2. Once processed (typically 5–15 min), go to App Store Connect → TestFlight.
3. Add the build to the **Internal Testing** group first. Internal testers receive the build immediately.
4. After internal sign-off (minimum 1 business day), add the build to the **External Testing** group. This triggers Apple's Beta App Review (typically same-day for minor updates).
5. Notify external testers via App Store Connect's "Notify Testers" button — do not use separate email threads.

**TestFlight release notes** (`What to Test`) should mirror the CHANGELOG entry for this version, scoped to new or changed behaviour testers should specifically exercise.

---

## App Store Submission

**Pre-submission checklist:**

- [ ] Marketing version and build number are correct in `project.pbxproj`.
- [ ] All new features are covered by at least one snapshot test.
- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) is up to date for any new API usage.
- [ ] App Store screenshots are generated at all required sizes (6.9" and 6.1" for iPhone; 13" and 11" for iPad) using the `fastlane snapshot` lane.
- [ ] App Store Connect metadata (description, keywords, what's new) is updated in `fastlane/metadata/`.
- [ ] TestFlight external review passed with no blocking feedback.
- [ ] CHANGELOG.md entry drafted and merged to `main`.

**Submission steps:**

1. In App Store Connect, select the build from TestFlight.
2. Fill "What's New in This Version" from `fastlane/metadata/en-US/release_notes.txt`.
3. Submit for Review. Select "Manually release this version" unless a time-sensitive fix requires immediate release.
4. After approval, release the version and create a git tag: `git tag ios/v<marketing-version>` and push.

---

## Triggering a Release Agent Run

A release agent automates the mechanical steps above. To trigger it:

1. Ensure `main` is green (all CI checks passing).
2. Create a file `ios-development-release/ios-release/resources/release-request.yaml` with the following structure:

```yaml
marketing_version: "1.4.0"
build_number: 142
release_notes: |
  - Zoom gesture now supports haptic feedback at snap points.
  - Module node edges render at correct scale when zoomed out past 0.5×.
distribution: testflight-internal   # or: testflight-external, app-store
```

3. Commit and push. The CI pipeline detects this file and triggers the `ios-release-agent` job.
4. The agent runs the archive, export, and upload steps. On completion it opens a PR updating `CFBundleShortVersionString` and `CFBundleVersion` and deletes the `release-request.yaml` file.
5. A human reviewer approves the PR to finalize the release record.

**Do not** manually run `xcodebuild archive` on a release branch while a release agent job is in progress — the two will conflict on the build number.
