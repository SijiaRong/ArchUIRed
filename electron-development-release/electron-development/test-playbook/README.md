---
name: Electron Development Test Playbook
description: "Playbook for verifying the Electron shell's IPC security model, filesystem access isolation, renderer adapter detection, and auto-update notification flow."
---

## Overview

This playbook verifies the Electron development module's critical behaviors: the IPC security boundary, path traversal prevention, renderer-side adapter detection, and the auto-update notification cycle.

---

## Playbook

### Group 1: IPC security and filesystem isolation

[init] The Electron app is running in development mode with a valid ArchUI project loaded. nodeIntegration is false and contextIsolation is true in the BrowserWindow configuration.

[action] From the renderer's browser devtools console, attempt to access Node.js built-in modules directly (e.g., attempt to call require('fs')).
[eval] The call fails with a reference error. Node.js APIs are not available in the renderer context. Only window.archFS is accessible.

[action] From the renderer, invoke window.archFS.readFile with a path that attempts directory traversal outside the repo root (e.g., ../../etc/passwd).
[eval] The IPC handler rejects the request before any filesystem read occurs. An error is returned to the renderer indicating an invalid path. No file content outside the repo root is returned.

[action] From the renderer, invoke window.archFS.readFile with a valid path to a README.md inside the repo root.
[eval] The file content is returned successfully as a UTF-8 string.

[end] Close the Electron app.

---

### Group 2: Renderer filesystem adapter detection

[init] The Electron app is launched. The React app bundle is the same as the web build.

[action] Inspect the active filesystem adapter in use by the running app.
[eval] The ipc adapter is active (window.archFS is defined), not the FSA or server adapter. All file operations go through IPC to the main process.

[action] Open the same built dist/ bundle in a regular browser tab (outside Electron).
[eval] window.archFS is undefined, so the FSA or server adapter is selected based on VITE_FS_MODE. No IPC calls are attempted.

[end] Close the browser tab and return to the Electron dev environment.

---

### Group 3: Auto-update notification

[init] The Electron app is running. A newer version is published on the GitHub Releases feed. The auto-updater is configured with the correct feed URL.

[action] The app starts up and the main process calls autoUpdater.checkForUpdatesAndNotify().
[eval] The updater contacts the GitHub Releases feed, detects the new version, and sends an updater:available IPC event to the renderer. The renderer displays a non-intrusive update-available banner in the UI.

[action] The update download completes and the updater fires the update-downloaded event.
[eval] The renderer receives the updater:ready IPC event and the banner changes to prompt the user to restart and install.

[action] The user confirms the install. The renderer invokes window.archFS's updater:install IPC call.
[eval] The main process calls autoUpdater.quitAndInstall(), the app quits, and the new version installs and relaunches.

[end] Verify the relaunched app reports the updated version number in the About panel.
