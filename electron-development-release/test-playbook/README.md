---
name: Electron Development and Release Test Playbook
description: Playbook for verifying that the electron-development-release module correctly scopes the Electron shell and release pipeline as independently testable concerns separate from the shared web frontend.
---

## Overview

This playbook verifies the top-level structure of the electron-development-release module: that the Electron shell extends the web frontend without duplicating it, and that Electron-only native integrations are confined to this module.

---

## Playbook

### Group 1: Shared codebase — no duplication

[init] The electron-development-release module has two submodules: electron-development and electron-release. The React app source lives in web-development-release/web-development/resources/src/.

[action] An agent scoped to this module is asked to add a new UI feature to the canvas.
[eval] The agent modifies only the shared React source (src/canvas/) and does not create separate Electron-specific UI components. The same change applies to both the web and Electron targets.

[action] An agent scoped to this module is asked to add native OS file drag-and-drop support.
[eval] The agent adds the native handling only in electron/main.ts and exposes it via the IPC surface in preload.ts. The React renderer receives the event through the existing window.archFS interface without needing a separate implementation path.

[end] Revert all source changes. Confirm that electron-development and electron-release submodules each have their own README intact.

---

### Group 2: Submodule conformance

[init] The electron-development-release module README lists two submodules: electron-development and electron-release.

[action] A new Electron-specific integration module (e.g., electron-menu/) needs to be added.
[eval] A new submodule folder is created under electron-development-release/ with a valid README.md and valid frontmatter. It is declared in the parent's submodules field. archui validate passes.

[action] The new submodule is removed.
[eval] The folder is deleted and removed from the parent's submodules list. archui validate passes with no orphaned references.

[end] Confirm the module tree is unchanged from its initial state.
