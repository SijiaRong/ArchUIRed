---
name: Android Development Test Playbook
description: "Playbook for verifying the Jetpack Compose canvas implementation, SAF-based filesystem traversal, LLM-sync integration, and coding conventions for the Android app."
---

## Overview

This playbook verifies the Android development module's key behaviors: canvas pan/zoom, SAF-based ArchUI tree traversal, drill-down navigation, and Figma MCP design token integration.

---

## Playbook

### Group 1: Canvas pan, zoom, and drill-down

[init] The Android app is running on a device or emulator (API 26+). The user has granted persistent URI permission to a valid ArchUI project directory via ACTION_OPEN_DOCUMENT_TREE. The project has at least one module with two declared submodules.

[action] Open the canvas view at the root module.
[eval] Exactly one Compose node card is rendered per direct submodule of the root. Each card displays the correct name and description from the module's README.md frontmatter.

[action] Apply a pinch-to-zoom gesture on the canvas.
[eval] The canvas scale changes smoothly. Scale is clamped between 0.2× and 4×. Node positions remain correct relative to one another throughout the zoom.

[action] Tap a node card to drill into a submodule.
[eval] Jetpack Navigation pushes the canvas/{moduleUuid} destination for the tapped module. The back stack grows by one entry, allowing the user to navigate back with the system back gesture.

[end] Press back to return to the root canvas. Confirm the root canvas still shows the correct nodes.

---

### Group 2: SAF filesystem traversal

[init] The app has a valid URI permission for an ArchUI project root. The ArchUITreeReader has performed an initial tree traversal and the StateFlow<ModuleTree> is populated.

[action] Verify that a module folder containing only a README.md (no subfolders) is correctly read and represented as a leaf node in the tree.
[eval] The module appears as a node in the canvas with no children. No error is reported for the missing subfolders.

[action] Verify that a resources/ subfolder inside a module is skipped during traversal.
[eval] No node is created for the resources/ folder. The parent module node renders without a child for resources/.

[action] Add a new module subfolder with a valid README.md to the ArchUI project directory, then trigger a manual refresh in the app.
[eval] The new module appears in the canvas on the next render after the StateFlow emits an updated ModuleTree.

[end] Remove the test module folder from disk. Trigger a manual refresh. Confirm it no longer appears in the canvas.

---

### Group 3: Figma MCP design token integration

[init] The Figma MCP tool is available in the agent's context. The ArchUI Figma file is open. The current ArchUITheme.kt has hardcoded color values instead of theme tokens.

[action] Use Figma MCP to extract the primary color style from the ArchUI Figma file and update the corresponding token in ArchUITheme.kt to reference the extracted value.
[eval] The hardcoded hex value is replaced with a named theme token. The composable that uses it now references MaterialTheme colors rather than a literal.

[action] Implement a new Composable that uses a color value and verify it references the theme token rather than a hardcoded value.
[eval] The Composable passes code review with no hardcoded color hex values. A lint rule or review comment confirms the token reference.

[end] Confirm the app builds and the updated theme renders correctly on both light and dark mode previews.
