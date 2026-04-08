---
name: Landing Screen
description: The entry-point screen where the user opens an existing ArchUI project or creates a new one; transitions to the canvas screen once a project is loaded.
---

## Overview

The landing screen is displayed on first launch and whenever no project is open. It is a single-state screen — it has no internal state machine — and its only job is to get a project into memory so the app can transition to the canvas.

The screen shows a centered wordmark, a grid of recent project cards (each displaying the project name and path), and two primary action buttons: "Open Folder…" to load an existing ArchUI project, and "New Project" to scaffold a fresh one. All three paths lead to the canvas/idle state.

Screen layout diagram and interaction table are in `resources/layout-and-interactions.md`. The committed web copy export for this screen is `web-copy.yaml`; web implementation must consume the generated artifact derived from that file rather than hardcoding landing copy in React.
