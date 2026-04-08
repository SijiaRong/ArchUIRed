---
name: Web Development and Release Test Playbook
description: "Playbook for verifying that the web-development-release module correctly scopes the web platform's frontend, backend server, and release workflows as independently testable sub-concerns."
---

## Overview

This playbook verifies the top-level structure of the web-development-release module: submodule scoping, the independence of the web-server from the SPA, and that new platform targets can be added cleanly.

---

## Playbook

### Group 1: Server-frontend independence

[init] The web-development-release module has three submodules: web-development, web-server, and web-release.

[action] A developer modifies only the React SPA (web-development) without touching web-server.
[eval] The web-server module's behavior and API contract are unchanged. The new SPA build can be served by the existing web-server without any server code changes.

[action] A developer updates the web-server's /api/fs API (e.g., adds a new endpoint).
[eval] The React SPA continues to work correctly because the existing endpoints are unchanged. The SPA uses only the existing adapter interface.

[end] Revert any source changes. Confirm archui validate passes.

---

### Group 2: Submodule conformance

[init] The web-development-release module README lists three submodules: web-development, web-server, web-release.

[action] An agent adds a new submodule (e.g., web-analytics/) under web-development-release/.
[eval] The new folder contains a valid README.md with all required frontmatter fields. It is declared in the parent's submodules list. archui validate passes.

[action] The new submodule is removed.
[eval] The folder is deleted and removed from the parent's submodules list. archui validate passes with no orphaned references.

[end] Confirm the module tree is unchanged from its initial state.
