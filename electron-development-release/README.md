---
name: Electron Development and Release
description: "Scopes all development and release workflows for the ArchUI Electron desktop app — a thin native shell around the shared React SPA that provides unrestricted filesystem access and auto-update distribution for macOS, Windows, and Linux."
---

## Overview

The `electron-development-release` module owns everything needed to develop, test, and ship the ArchUI Electron desktop application.

Electron's purpose is simple: provide the same ArchUI experience as the web platform, but with direct, unrestricted native filesystem access — no server process required, no browser permission prompts. The React app is identical; only the filesystem adapter differs.

## Submodules

- **electron-development** — Electron main/renderer process architecture, IPC bridge design, preload script security model, and auto-update integration.
- **electron-release** — electron-builder packaging, macOS notarization, Windows Authenticode signing, GitHub Releases distribution, and release checklist.

## Relationship to Web Platform

The Electron app is not a separate application. It uses the same React SPA source from `web-development-release/web-development/resources/`. The shared codebase runs identically in both contexts. The only runtime difference is the filesystem adapter: in Electron, `window.archFS` is defined by the preload script's `contextBridge`, and the SPA's adapter switch selects the IPC adapter automatically.

No web-server is started alongside Electron — the main process handles filesystem operations directly via Node.js `fs`.
