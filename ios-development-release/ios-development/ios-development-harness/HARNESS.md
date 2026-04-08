---
name: iOS Development Test Playbook
description: "Playbook for verifying the SwiftUI canvas implementation, SAF-equivalent filesystem traversal, Figma MCP token sync, and coding conventions for the iOS app."
---

## Overview

This playbook verifies the iOS development module's key behaviors: canvas rendering from README frontmatter, filesystem traversal logic, git-diff-triggered sync, and Figma MCP design token integration.

---

## Playbook

### Group 1: Canvas rendering from frontmatter

[init] The iOS app is running in Xcode simulator (iOS 17+). A valid ArchUI project directory is configured as the archui-root in UserDefaults. The project has at least one module with two declared submodules and one cross-module link.

[action] Launch the app and navigate to the configured root module.
[eval] The canvas renders exactly one node per direct submodule of the root. Nodes display the correct name and description from each module's README.md frontmatter. A bezier-curve edge is drawn for the cross-module link with its relation type visible.

[action] Double-tap a node to drill into a submodule.
[eval] The NavigationStack pushes a new canvas view showing only that submodule's children. The breadcrumb trail updates to reflect the new active module path.

[action] Zoom out past the 0.5× scale threshold.
[eval] Node labels collapse to icon-only mode. Node cards remain tappable and correctly positioned within the logical 4096×4096 pt coordinate space.

[end] Close the simulator. No filesystem changes were made during this test.

---

### Group 2: Filesystem traversal and git-diff sync

[init] The iOS app has a valid archui-root configured. The FileSyncEngine has completed an initial full tree walk and the ModuleGraph is populated in memory.

[action] Manually edit a README.md file in the ArchUI project to update a module's description, then commit the change with git.
[eval] The GitDiffWatcher detects the change to .git/refs/heads/<branch> mtime. Only the changed README.md is re-parsed. The corresponding ModuleNode in the graph is updated with the new description without a full tree re-walk.

[action] Add a new submodule folder with a valid README.md and declare it in the parent's frontmatter. Commit the change.
[eval] The new module folder is picked up on the next sync. The parent's submodules list is respected, and the new node appears in the canvas when the parent module is viewed.

[action] Add a resources/ folder inside an existing module. Commit the change.
[eval] The FileSyncEngine skips the resources/ folder during traversal. No spurious module node is created for it.

[end] Revert all test commits. Confirm the ModuleGraph reflects the original state after a manual refresh.

---

### Group 3: Figma MCP design token sync

[init] The Figma desktop app is running with the ArchUI MCP plugin active and the local MCP server listening at localhost:3845. The current DesignTokens/ files are present but out of date.

[action] Run the swift run figma-token-gen tool from the project's Tools/ directory.
[eval] The tool contacts the Figma MCP server, fetches the latest design tokens, and regenerates the Swift files in Sources/ArchUI/DesignTokens/. The updated tokens are reflected in the running app on the next build.

[action] Attempt to hand-edit a file in Sources/ArchUI/DesignTokens/.
[eval] The convention is violated — the DesignTokens/ files are noted as auto-generated and should not be hand-edited. A code review or lint check flags the manual change.

[end] Restore the original DesignTokens/ state by re-running figma-token-gen. Confirm the build passes.
