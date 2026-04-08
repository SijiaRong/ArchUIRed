---
name: Web Development Test Playbook
description: "Playbook for verifying the React web app development workflow, including filesystem adapter switching, canvas rendering from frontmatter, server adapter connectivity, and Figma MCP token sync."
---

## Overview

This playbook verifies the web development module's key behaviors: the filesystem adapter switch between FSA and server modes, canvas rendering driven by README frontmatter, and the Figma MCP design token sync workflow.

---

## Playbook

### Group 1: Filesystem adapter behavior

[init] The web app is running locally with VITE_FS_MODE=fsa in .env.local. A valid ArchUI project directory is available on disk.

[action] The user opens the app in Chrome and clicks the "Open Project" button.
[eval] The browser displays a native directory picker dialog (window.showDirectoryPicker). After the user selects the ArchUI root directory, the canvas renders the root module's direct submodules as nodes. No server request is made for filesystem operations.

[action] The user navigates to a submodule by double-clicking one of the canvas nodes.
[eval] The canvas re-renders showing that submodule's direct children as nodes. The breadcrumb trail at the top updates to reflect the new active module path.

[action] The web-server is running on port 3001. The app is reloaded with VITE_FS_MODE=server.
[eval] The canvas loads and renders normally, with all filesystem reads routed through HTTP calls to localhost:3001/api/fs/read. The server adapter is active and FSA is not used.

[action] Open the app in Firefox with VITE_FS_MODE=server and the web-server running.
[eval] The canvas loads and renders correctly in Firefox. All filesystem reads go through the server adapter, since Firefox does not support FSA.

[end] Close the browser tab and stop the dev server.

---

### Group 2: Canvas rendering from frontmatter

[init] The web app is running with a valid ArchUI project open. A module named "feature-x" exists with two submodules declared in its frontmatter and one cross-module link.

[action] Navigate to the feature-x module in the canvas.
[eval] Exactly two nodes appear on the canvas, one for each declared submodule. One directed edge appears representing the cross-module link, labeled with its relation type.

[action] Manually add a new submodule entry to feature-x/README.md frontmatter (without refreshing the app).
[eval] After the app detects the file change and re-fetches, a third node appears on the canvas for the newly declared submodule.

[end] Revert the frontmatter change. Confirm the canvas returns to showing two nodes.

---

### Group 3: Figma MCP design token sync

[init] The Figma MCP server is running and reachable at the configured VITE_FIGMA_MCP_ENDPOINT. The checked-in `gui/design-system/foundations/web-token-export.yaml` snapshot and generated `src/design-tokens.generated.css` are both present but out of date relative to the Figma file.

[action] Run the npm run sync:figma command.
[eval] The command refreshes the checked-in token export snapshot and regenerates `src/design-tokens.generated.css` with the new values. Vite HMR picks up the change and the UI reflects updated colors or spacing without a manual refresh.

[end] Restore the original `gui/design-system/foundations/web-token-export.yaml` and `src/design-tokens.generated.css`. Stop the Figma MCP server.

---

### Group 4: Local deploy script

[init] A clean clone of the repository with no `node_modules` present in `web-development-release/web-dev/resources/` and no `.env.local` file.

[action] Run `./web-development-release/web-dev/resources/deploy-local.sh` from the repo root.
[eval] The script checks Node 20+ is available. It runs `npm install`, creates `.env.local` with `VITE_FS_MODE=fsa` defaults, and starts the Vite dev server. The terminal shows "Starting Vite dev server (FSA mode) → http://localhost:5173".

[action] Run `./web-development-release/web-dev/resources/deploy-local.sh server`.
[eval] The script starts Vite with `VITE_FS_MODE=server` and prints a reminder that web-server must be on port 3001. No npm install step is needed (node_modules already present).

[action] Run `./web-development-release/web-dev/resources/deploy-local.sh build`.
[eval] The script delegates to the web-build pipeline (`build.mjs`). Files are staged from each module's `resources/`, Vite compiles in production mode, and `build/dist/index.html` plus hashed asset files are written. The terminal confirms "built in Xms" with no errors.

[action] Run `./web-development-release/web-dev/resources/deploy-local.sh build` on a machine with Node 18.
[eval] The script exits with "error: Node 20+ required" before running npm or Vite.

[end] Delete the generated `build/stage/` and `build/dist/` directories. Remove `.env.local` if created during the test.
