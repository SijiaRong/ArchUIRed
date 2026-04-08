---
name: iOS Release Test Playbook
description: "Playbook for verifying the iOS release workflow including versioning, archive build, TestFlight distribution, App Store submission steps, and the release agent trigger mechanism."
---

## Overview

This playbook verifies the iOS release module's key steps: correct versioning, archive build, TestFlight distribution flow, App Store submission readiness, and the release-agent trigger via release-request.yaml.

---

## Playbook

### Group 1: Versioning and archive build

[init] The main branch is green with all CI checks passing. The CHANGELOG.md entry for the new version is drafted. No uncommitted changes exist.

[action] Update CFBundleShortVersionString (marketing version) and CFBundleVersion (build number) in ArchUI.xcodeproj/project.pbxproj for the new release.
[eval] The marketing version follows semver rules (PATCH for bug fixes, MINOR for features, MAJOR for schema changes). The build number is strictly greater than the last build number in App Store Connect. No separate Version.swift file is created.

[action] Run xcodebuild archive with the Release configuration targeting generic/platform=iOS.
[eval] The archive completes without errors and produces an ArchUI.xcarchive at the specified path.

[action] Export the .ipa from the archive using ExportOptions-AppStore.plist.
[eval] An .ipa file is produced in the build/ArchUI-AppStore/ directory. The export method is app-store and the teamID matches the registered Apple Developer team.

[end] Retain the .ipa for the TestFlight upload step. The archive is available at ./build/ArchUI.xcarchive.

---

### Group 2: TestFlight and App Store submission

[init] A valid .ipa has been built and exported. The Apple Developer account is active with a valid Distribution certificate and no expiry within 30 days.

[action] Upload the .ipa to App Store Connect using xcrun altool or Transporter.
[eval] The upload completes and the build appears in App Store Connect's TestFlight section within 15 minutes. The build number matches the one set in project.pbxproj.

[action] Add the new build to the Internal Testing group in App Store Connect.
[eval] Internal testers receive a TestFlight notification. The build installs and launches without crashes on at least one test device.

[action] After a minimum 1 business day of internal sign-off, add the build to the External Testing group.
[eval] Apple's Beta App Review begins. For a minor update with no new data collection, review completes the same day. External testers are notified via the Notify Testers button in App Store Connect.

[action] Verify the App Store submission pre-checklist: marketing version, build number, privacy manifest updated, screenshots at all required sizes (6.9" and 6.1" iPhone; 13" and 11" iPad), metadata updated in fastlane/metadata/.
[eval] All checklist items pass. No missing screenshots or outdated metadata warnings appear in App Store Connect.

[end] Submit the build for App Store review. After approval, release manually and create the git tag ios/v<marketing-version>.

---

### Group 3: Release agent trigger

[init] The main branch is green. A new release is ready to be automated via the release agent.

[action] Create the file ios-development-release/ios-release/resources/release-request.yaml with the correct fields: marketing_version, build_number, release_notes, and distribution set to testflight-internal.
[eval] The file is syntactically valid YAML. The build_number is greater than the last uploaded build in App Store Connect.

[action] Commit and push the release-request.yaml file to the main branch.
[eval] The CI pipeline detects the file and triggers the ios-release-agent job. The agent runs the archive, export, and upload steps without requiring manual intervention.

[action] After the agent completes, inspect its output PR.
[eval] The PR updates CFBundleShortVersionString and CFBundleVersion in project.pbxproj to match the values in release-request.yaml, and deletes the release-request.yaml file. A human reviewer approves the PR to finalize the release record.

[end] Merge the agent's PR. Confirm that release-request.yaml is no longer present in the repository.
