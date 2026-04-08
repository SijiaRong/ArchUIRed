---
name: "iOS Development & Release Test Playbook"
description: "Playbook for verifying that the iOS module correctly scopes native SwiftUI development and App Store release workflows, and enforces agent boundary rules."
---

## Overview

This playbook verifies the iOS Development & Release module's agent scoping rules, submodule structure, and boundary enforcement.

---

## Playbook

### Group 1: Agent scope enforcement

[init] An iOS agent is initialized with the ios-development-release module loaded. The ios-development and ios-release submodules are both present with valid README files.

[action] The agent is asked to implement a new canvas zoom gesture.
[eval] The agent reads ios-development/README.md before modifying any Swift source. No files outside the ios-development-release/ tree or gui/ are modified without explicit cross-module approval.

[action] The agent is asked to submit a new build to TestFlight.
[eval] The agent reads ios-release/README.md before performing any release step. The agent does not invoke any CLI or git operations outside the scope defined by the ios-release module.

[action] The agent is asked to change the ArchUI filesystem rules schema.
[eval] The agent refuses or escalates to a cross-module approval step, since core/ is outside this module's scope.

[end] No files have been modified outside ios-development-release/. Agent session ends cleanly.

---

### Group 2: Submodule structure validity

[init] The ios-development-release module exists with two submodules declared: ios-development and ios-release.

[action] Verify that both ios-development/ and ios-release/ folders exist and each contains a valid README.md with correct frontmatter.
[eval] archui validate passes with no errors for ios-development-release/ and both submodules.

[action] Add a new ios-development-release/ios-beta/ folder with a valid README.md and declare it in the parent's submodules field.
[eval] archui validate passes with no errors. The new submodule is recognized as a valid scoped module within the iOS platform group.

[end] Remove ios-beta/ and remove it from the parent submodules field. Confirm archui validate passes.
