---
name: "Android Development & Release Test Playbook"
description: "Playbook for verifying that the Android module correctly scopes native Jetpack Compose development and Google Play release workflows, and enforces agent boundary rules."
---

## Overview

This playbook verifies the Android Development & Release module's agent scoping rules, submodule structure, and boundary enforcement.

---

## Playbook

### Group 1: Agent scope and boundary enforcement

[init] An Android agent is initialized with the android-development-release module loaded. Both android-development and android-release submodules are present.

[action] The agent is asked to implement a new Compose animation for node drill-down.
[eval] The agent reads android-development/README.md before making any code changes. No files outside the android-development-release/ tree or gui/ are modified without cross-module approval.

[action] The agent is asked to upload a new AAB to the Google Play internal track.
[eval] The agent reads android-release/README.md before initiating the upload. The agent verifies that versionCode has been incremented from the last uploaded build.

[action] The agent is asked to modify the core ArchUI README schema to add a new frontmatter field.
[eval] The agent refuses or escalates, as core/ is outside this module's defined scope.

[end] No files have been modified outside android-development-release/. Agent session ends cleanly.

---

### Group 2: Submodule structure validity

[init] The android-development-release module exists with two submodules declared: android-development and android-release.

[action] Verify both android-development/ and android-release/ folders exist with valid README.md files.
[eval] archui validate passes with no errors for android-development-release/ and both submodules.

[action] Add an android-development-release/android-beta/ folder with a valid README.md and declare it in the parent's submodules field.
[eval] archui validate passes with no errors. The new submodule is recognized as a valid addition.

[end] Remove android-beta/ and remove it from the parent submodules field. Confirm archui validate passes.
