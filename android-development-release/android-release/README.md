---
name: Android Release
description: "Covers the full Android release workflow including versioning, keystore signing, Google Play track rollout, the release checklist, and how to trigger an agent-driven release run."
---

## Overview

This module defines the release engineering process for the ArchUI Android app. A release agent (or a human following this document) must complete every step in the checklist below before promoting a build beyond internal testing. The process is designed to be reproducible by an automated agent with access to the project repository, keystore credentials, and the Google Play Developer API.

## Pre-Build Validation

Before starting any release build or deployment, run the ArchUI CLI validator to confirm the module tree is structurally valid:

```bash
archui validate .
```

If validation reports any `ERROR`, resolve all issues before proceeding. Never build or upload an AAB against an invalid module tree.

## Versioning

ArchUI Android uses a two-part version scheme managed in `app/build.gradle.kts`:

```kotlin
android {
    defaultConfig {
        versionCode = 42          // monotonically increasing integer, never reused
        versionName = "1.4.0"    // semver: MAJOR.MINOR.PATCH
    }
}
```

**Rules:**
- `versionCode` must be incremented by at least 1 for every build uploaded to any Play track, including internal.
- `versionName` follows semver: increment PATCH for bug fixes, MINOR for new features, MAJOR for breaking changes to the ArchUI data model or navigation contract.
- `versionCode` and `versionName` are the single source of truth — do not maintain a separate `CHANGELOG` or `VERSION` file that can drift out of sync. Release notes are written directly in the Play Console or passed via the `releaseNotes` field of the Play Developer API request.

## Keystore and Signing

Release builds are signed with the ArchUI upload keystore. The keystore file and credentials are **never** committed to the repository.

**Signing config (injected via environment variables or `local.properties`):**
```kotlin
signingConfigs {
    create("release") {
        storeFile = file(System.getenv("ARCHUI_KEYSTORE_PATH") ?: properties["keystorePath"].toString())
        storePassword = System.getenv("ARCHUI_KEYSTORE_PASS") ?: properties["keystorePass"].toString()
        keyAlias = System.getenv("ARCHUI_KEY_ALIAS") ?: properties["keyAlias"].toString()
        keyPassword = System.getenv("ARCHUI_KEY_PASS") ?: properties["keyPass"].toString()
    }
}
buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        isMinifyEnabled = true
        proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
    }
}
```

For local release builds, populate `local.properties` (gitignored). For CI/CD and agent-driven releases, inject the four environment variables from the secrets store.

Build the release AAB:
```bash
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

## Google Play Track Rollout

ArchUI uses the standard four-track progression on Google Play:

| Track | Audience | Promotion criteria |
|---|---|---|
| internal | Team members (up to 100 testers) | Any passing build; no review required |
| alpha (closed testing) | Opted-in external testers | Smoke test passed, no P0/P1 crashes in internal |
| beta (open testing) | Anyone who opts in | Alpha soak for at least 3 days, crash-free rate ≥ 99.5% |
| production | All users | Beta soak for at least 7 days, crash-free rate ≥ 99.8%, release checklist complete |

Production rollouts begin at 10% of users and are monitored for 24 hours before full rollout. Use the Play Console's "Managed publishing" feature so that promotion to 100% requires an explicit confirmation step.

## Release Checklist

An agent-driven release run must complete every item. A human reviewer must sign off on items marked **[human]**.

### Pre-build
- [ ] `versionCode` incremented from the last upload in Play Console (verify via API or console)
- [ ] `versionName` updated per semver rules
- [ ] All open P0/P1 issues in the tracker are resolved or explicitly deferred with justification
- [ ] `./gradlew lint` passes with zero errors
- [ ] `./gradlew testReleaseUnitTest` passes
- [ ] `./gradlew connectedAndroidTest` passes on a physical device or Firebase Test Lab (API 26 and API 34 minimum)
- [ ] Figma design review complete — no outstanding design-system token violations **[human]**

### Build
- [ ] `./gradlew bundleRelease` succeeds
- [ ] AAB is signed with the correct upload key (verify with `jarsigner -verify -verbose -certs app-release.aab`)
- [ ] AAB size does not exceed 150 MB (Play hard limit is 200 MB; keep headroom)

### Play Console submission
- [ ] AAB uploaded to the **internal** track
- [ ] Release notes written for all supported locales (at minimum `en-US`)
- [ ] Store listing screenshots are current (no stale UI from a prior design iteration) **[human]**
- [ ] Content rating questionnaire is up to date if new content categories were introduced
- [ ] Target SDK is current (Google requires targeting within 1 year of the latest API level)

### Promotion gates
- [ ] Internal → alpha: smoke test on physical device, zero crash on startup and basic navigation
- [ ] Alpha → beta: 3-day soak, crash-free rate ≥ 99.5% in Play Console Android vitals
- [ ] Beta → production: 7-day soak, crash-free rate ≥ 99.8%, ANR rate ≤ 0.47% **[human approval required]**
- [ ] Production staged rollout: start at 10%, monitor for 24 h, then promote to 100%

## Triggering an Agent Release Run

To initiate an automated release, create a task in the ArchUI task system with the following structure:

```
action: android-release
versionCode: <next integer>
versionName: <semver string>
track: internal | alpha | beta | production
releaseNotes:
  en-US: "<plain text, max 500 chars>"
```

The release agent will:
1. Check out the specified commit (or `HEAD` of `main` if unspecified).
2. Update `versionCode` and `versionName` in `build.gradle.kts`, commit, and push.
3. Run the full pre-build checklist (lint + unit tests + connected tests via Firebase Test Lab).
4. Build the release AAB using the keystore credentials from the secrets store.
5. Upload the AAB to the specified track using the Google Play Developer API (`edits.insert` → `edits.bundles.upload` → `edits.tracks.update` → `edits.commit`).
6. Post a summary of the run (pass/fail per checklist item, Play Console edit ID) to the task output.

The agent does **not** autonomously promote beyond internal without a human sign-off step in the task.

## Rollback

Google Play does not support pulling an already-live build from production instantly, but a rollout can be halted at the current percentage. For a critical P0 regression discovered in production:

1. Pause the staged rollout immediately in Play Console (or via API: `edits.tracks.update` with `userFraction: 0`).
2. Prepare a hotfix build with `versionCode + 1`.
3. Fast-track through internal → alpha with expedited soak (minimum 1 hour with manual validation).
4. Resume rollout with the hotfix build.

Never attempt to re-upload a previously submitted `versionCode` — Play will reject it.
