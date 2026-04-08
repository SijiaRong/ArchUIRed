---
name: Electron Release
description: "Defines the Electron desktop app release workflow, covering electron-builder packaging, macOS notarization and Windows Authenticode signing, GitHub Releases distribution, auto-update feed configuration, and the platform-specific release checklist."
---

## Overview

The Electron release process takes the compiled main process, preload script, and Vite-built renderer bundle and produces signed, notarized installers for macOS (`.dmg`, `.zip`) and Windows (`.exe` NSIS installer). Releases are distributed via GitHub Releases; the auto-updater in the running app pulls from the same release feed.

## Pre-Build Validation

Before starting any release build or deployment, run the ArchUI CLI validator to confirm the module tree is structurally valid:

```bash
archui validate .
```

If validation reports any `ERROR`, resolve all issues before proceeding. Never package or distribute an Electron release against an invalid module tree.

## Build Prerequisites

```bash
npm run electron:build
# 1. tsc -p tsconfig.electron.json  → dist-electron/main.js, preload.js
# 2. vite build                     → dist/ (renderer)
# 3. electron-builder               → release/ (platform installers)
```

## electron-builder Configuration

Key sections of `electron-builder.yml`:

```yaml
appId: com.archui.desktop
productName: ArchUI

files:
  - dist/**/*              # Vite renderer build
  - dist-electron/**/*     # Compiled main + preload
  - package.json

directories:
  output: release

publish:
  provider: github
  owner: <github-org>
  repo: archui

mac:
  category: public.app-category.developer-tools
  hardenedRuntime: true
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  notarize: true

dmg:
  sign: false

win:
  target: nsis
  signingHashAlgorithms: [sha256]
  certificateSubjectName: <certificate CN>

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true

linux:
  target: AppImage
```

## Code Signing

### macOS

**Environment variables:**
```
APPLE_ID=developer@example.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX
CSC_LINK=base64-encoded-p12-certificate
CSC_KEY_PASSWORD=<p12-password>
```

Notarization is automatic when `notarize: true` is set and the above env vars are present. Do not skip notarization — unsigned/unnotarized builds are blocked on recent macOS.

**Entitlements** (`build/entitlements.mac.plist`) must include:
```xml
<key>com.apple.security.cs.allow-jit</key><true/>
<key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
```

### Windows

**Environment variables:**
```
WIN_CSC_LINK=path/to/certificate.p12
WIN_CSC_KEY_PASSWORD=<p12-password>
```

EV certificates suppress SmartScreen warnings immediately; OV certificates build reputation over time.

### Linux

Linux AppImages are not signed by convention.

## Distribution via GitHub Releases

CI (`release-electron` workflow) triggers on version tags (`v*`):

1. Check out tag, `npm ci`
2. `npm run electron:build` (matrix: `macos-latest`, `windows-latest`, `ubuntu-latest`)
3. electron-builder uploads artifacts to the GitHub Release draft
4. All three platform builds succeed → release published

Assets for a typical release:
```
ArchUI-1.2.3-arm64.dmg           macOS Apple Silicon installer
ArchUI-1.2.3-arm64-mac.zip       macOS zip (auto-update target)
ArchUI-1.2.3.dmg                 macOS Intel installer
ArchUI-1.2.3-mac.zip             macOS Intel zip
ArchUI-Setup-1.2.3.exe           Windows NSIS installer
ArchUI-1.2.3.AppImage            Linux AppImage
latest-mac.yml                   Auto-update feed (macOS)
latest.yml                       Auto-update feed (Windows/Linux)
```

## Release Checklist

Before tagging an Electron release:

- [ ] `web-release` checklist complete — Vite renderer build is production-ready
- [ ] `npm run electron:build` succeeds locally on at least one platform
- [ ] Auto-update tested: install previous release, verify it detects and installs the new build
- [ ] macOS: app launches without Gatekeeper warning on a clean machine (verifies notarization)
- [ ] Windows: installer runs without SmartScreen blocking
- [ ] Linux: AppImage launches on Ubuntu LTS
- [ ] `CHANGELOG.md` updated
- [ ] `npm version <patch|minor|major>` run
- [ ] Tag pushed: `git push origin main --tags`
- [ ] CI `release-electron` workflow passes on all three platform runners
- [ ] GitHub Release assets all present; release published (not draft)
- [ ] Verify auto-updater detects new version in a running older install
