---
name: Electron Release Test Playbook
description: "Playbook for verifying the Electron release workflow, including electron-builder packaging, code signing correctness, GitHub Releases distribution, and auto-update feed detection."
---

## Overview

This playbook verifies the Electron release module's key steps: the electron-builder packaging pipeline, code signing on macOS and Windows, GitHub Releases artifact upload, and auto-updater feed detection.

---

## Playbook

### Group 1: Build pipeline

[init] The repository is on the main branch. npm run electron:build has not been run yet. No release/ directory exists.

[action] Run npm run electron:build on macOS.
[eval] The build completes in three stages: TypeScript compilation produces dist-electron/main.js and preload.js; Vite build produces dist/; electron-builder produces .dmg and .zip artifacts in release/. The command exits with code 0.

[action] Inspect the macOS .dmg artifact by mounting it and checking the app bundle.
[eval] The app bundle contains the correct Info.plist with the expected appId and version. The app launches without errors.

[end] Remove the release/ and dist-electron/ directories.

---

### Group 2: Code signing and notarization (macOS)

[init] The macOS build artifacts from Group 1 are present. All required Apple signing environment variables are set.

[action] Verify the app binary is signed by running codesign --verify --deep --strict ArchUI.app.
[eval] codesign reports no errors. The signing identity matches the Developer ID Application certificate.

[action] Verify notarization by running spctl --assess --type exec ArchUI.app.
[eval] spctl reports "accepted" — the app passes Gatekeeper assessment on a clean macOS machine.

[end] Clean up build artifacts.

---

### Group 3: GitHub Releases distribution

[init] A version tag (e.g., v1.2.4) has been pushed to the repository. The CI release-electron workflow has triggered.

[action] Monitor the GitHub Actions workflow for all three platform runners (macos-latest, windows-latest, ubuntu-latest).
[eval] All three build jobs complete successfully. The GitHub Release draft is populated with all expected artifacts: two .dmg files, two .zip files, one .exe, one .AppImage, latest-mac.yml, and latest.yml.

[action] Publish the GitHub Release (draft → published).
[eval] The release is publicly visible. All artifact download links resolve correctly.

[end] Confirm the release page shows the correct version and all artifacts are downloadable.

---

### Group 4: Auto-update detection

[init] An older version of the Electron app is installed and running. The new v1.2.4 release has been published on GitHub Releases.

[action] The app starts. The main process calls autoUpdater.checkForUpdatesAndNotify().
[eval] The updater reads latest-mac.yml (or latest.yml on Windows), detects that v1.2.4 is newer than the installed version, and sends an updater:available event. The UI shows an update-available banner.

[action] The update downloads in the background. The updater fires update-downloaded.
[eval] The UI banner changes to "Restart to update". The user clicks restart.

[eval] The app relaunches with the new version. The About panel shows v1.2.4.

[end] Confirm the update cycle is complete. No manual intervention was required.
