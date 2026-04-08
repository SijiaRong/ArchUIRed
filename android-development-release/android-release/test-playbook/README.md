---
name: Android Release Test Playbook
description: "Playbook for verifying the Android release workflow including versioning rules, keystore signing, Play Store track promotion gates, and the agent-driven release trigger."
---

## Overview

This playbook verifies the Android release module's key steps: versioning correctness, AAB build and signing, Play Store track promotion gates, and the automated release agent trigger.

---

## Playbook

### Group 1: Versioning and AAB build

[init] The main branch is green with all CI checks passing. versionCode and versionName in app/build.gradle.kts reflect the previous release. No uncommitted changes.

[action] Update versionCode to the next integer and versionName to the new semver string in app/build.gradle.kts.
[eval] versionCode is strictly greater than the last versionCode uploaded to any Play track. versionName follows semver rules (PATCH for fixes, MINOR for features, MAJOR for breaking changes).

[action] Run ./gradlew lint and ./gradlew testReleaseUnitTest.
[eval] Both commands complete with zero errors.

[action] Run ./gradlew bundleRelease with the keystore credentials provided via environment variables.
[eval] The release AAB is produced at app/build/outputs/bundle/release/app-release.aab. The AAB is signed with the correct upload key (verifiable via jarsigner). The AAB size is under 150 MB.

[end] The signed AAB is ready for Play Console upload. Source files are unchanged beyond the version bump.

---

### Group 2: Play Store track promotion gates

[init] The signed AAB from Group 1 has been uploaded to the internal track in Play Console. Internal testers have access to the build.

[action] Perform a smoke test on a physical device: launch the app, open the canvas, drill into a submodule, navigate back, and trigger a manual sync.
[eval] The app completes all actions without crashing. The crash-free rate in Android Vitals shows 100% for the internal build after at least one session.

[action] Promote the build from internal to alpha (closed testing) after the smoke test passes.
[eval] The build is now available to opted-in alpha testers. No Play review is required for this promotion.

[action] After a minimum 3-day alpha soak with crash-free rate ≥ 99.5%, promote the build to beta (open testing).
[eval] The build is now available to anyone who opts in via the Play Store listing.

[action] After a minimum 7-day beta soak with crash-free rate ≥ 99.8% and ANR rate ≤ 0.47%, initiate a production staged rollout at 10%.
[eval] The rollout begins at 10% of production users. Managed publishing is enabled so that promotion to 100% requires an explicit confirmation step in Play Console.

[end] Monitor the production rollout for 24 hours. If no regressions are detected, promote to 100%. Create a git tag for the release.

---

### Group 3: Agent-driven release trigger

[init] The main branch is green. A new release is ready to be automated.

[action] Create a release task in the ArchUI task system with the required fields: action set to android-release, versionCode, versionName, track set to internal, and release notes in en-US.
[eval] The release agent checks out the specified commit, updates versionCode and versionName in build.gradle.kts, commits and pushes, then runs the full pre-build checklist.

[action] The release agent completes lint, unit tests, and connected tests via Firebase Test Lab.
[eval] All checklist items pass. The AAB is built with the keystore credentials from the secrets store.

[action] The agent uploads the AAB to the internal track via the Google Play Developer API.
[eval] The upload succeeds, a Play Console edit is committed, and the agent posts a summary of the run (pass/fail per checklist item, Play Console edit ID) to the task output. No promotion beyond internal is made without human sign-off.

[end] A human reviewer confirms the internal build in Play Console. The automated task is marked complete.
