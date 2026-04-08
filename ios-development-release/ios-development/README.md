---
name: iOS Development
description: "Defines the SwiftUI implementation workflow for the ArchUI canvas, including local setup, coding conventions, Figma MCP integration, and the file-sync approach for keeping the module tree in sync."
---

## Overview

This module documents how to develop the native iOS ArchUI application. The app is written in SwiftUI and targets iOS 17+. Its central metaphor mirrors the ArchUI architecture itself: a zoomable, infinitely scrollable canvas of module nodes where each node can be drilled into via a `NavigationStack` push.

---

## Pre-Build Validation

Before compiling or deploying, always run the ArchUI CLI validator to ensure the module tree conforms to the filesystem rules:

```bash
archui validate .
```

If validation reports any `ERROR`, fix all issues before proceeding with the build. Do not compile or deploy against a structurally invalid module tree.

## Local Development Setup

**Requirements**

- Xcode 16+ (Swift 6 toolchain)
- macOS 15+ on the development machine
- Active Apple Developer Program membership (for device signing)
- Figma desktop app with the ArchUI Figma MCP plugin enabled

**Repository layout (within the Xcode project)**

```
ArchUI.xcodeproj
Sources/
  ArchUI/
    App/            — AppDelegate, scene lifecycle
    Canvas/         — CanvasView, NodeView, ZoomGestureHandler
    Navigation/     — NavigationCoordinator, DrillDownStack
    Sync/           — FileSyncEngine, GitDiffWatcher
    DesignTokens/   — Auto-generated from Figma MCP (do not hand-edit)
    Models/         — ModuleNode, ReadmeFrontmatter, Link
```

Run `xcodegen generate` after any structural change to regenerate the `.xcodeproj` before opening Xcode.

---

## Canvas Implementation

The ArchUI canvas is implemented as a `CanvasView: View` that wraps a `ScrollView` with `.simultaneousGesture(MagnificationGesture())`. Key design decisions:

- **Coordinate space:** Canvas uses a fixed logical coordinate system (4096×4096 pts). Module nodes are positioned by their stored `(x, y)` offset within this space.
- **Zoom:** `ZoomGestureHandler` clamps scale between `0.25` and `3.0`. At zoom < `0.5`, node labels collapse to icon-only mode.
- **Node rendering:** Each `ModuleNode` is a `NodeView` SwiftUI view. `NodeView` reads a `ModuleNodeViewModel` which is hydrated from the module's `README.md` frontmatter (`uuid`, `name`, `description`).
- **Drill-down:** Tapping a `NodeView` pushes a `ModuleDetailView` onto the `NavigationStack`. The detail view renders the full Markdown body of the module's `README.md` using `AttributedString`-based rendering.
- **Links:** Cross-module links stored in frontmatter are rendered as bezier-curve edges on the canvas using a `Canvas { context, size }` overlay layer.

---

## Reading the ArchUI Filesystem

The `FileSyncEngine` is responsible for traversing the ArchUI module tree on the local filesystem and constructing a live `ModuleGraph` in memory.

**Algorithm:**

1. Start from the configured `archui-root` path (stored in `UserDefaults`; defaults to `~/archui`).
2. Recursively enumerate subfolders. Any folder containing a `README.md` is treated as a module.
3. Parse the YAML frontmatter of each `README.md` into a `ReadmeFrontmatter` struct. Fields: `uuid`, `name`, `description`, `submodules`, `links`.
4. The `resources/` subfolder is explicitly skipped — it is not a module.
5. Build a `[UUID: ModuleNode]` dictionary keyed by the frontmatter `uuid` field.
6. Resolve `links` arrays to typed `Edge` values in the graph.

---

## File-Sync Approach (git diff + on-demand LLM sync)

ArchUI files live in a git repository. The iOS app does not poll for changes; instead it uses a **git-diff-triggered sync**:

1. A `GitDiffWatcher` monitors the `.git/refs/heads/<branch>` mtime using `DispatchSource.makeFileSystemObjectSource`.
2. On any change, it runs `git diff --name-only HEAD~1 HEAD` via `Process` to identify which `README.md` files changed.
3. Only the changed files are re-parsed and their `ModuleNode` records updated in the graph — avoiding a full tree walk.
4. On-demand LLM sync: when a module detail view is open and the user triggers "Sync with LLM", the app sends the current `README.md` content plus a prompt to the configured LLM endpoint, and writes the response back to disk. This triggers the `GitDiffWatcher` flow naturally.

---

## Figma MCP Integration

UI component designs and design tokens live in Figma and are made available to the iOS project via the Figma MCP (Model Context Protocol) plugin.

**Workflow:**

1. Open the Figma desktop app and activate the ArchUI MCP plugin.
2. The plugin exposes a local MCP server at `http://localhost:3845`.
3. Run `swift run figma-token-gen` (a local Swift script in `Tools/`) to pull the latest design tokens and regenerate `Sources/ArchUI/DesignTokens/`. Commit the result.
4. When implementing a new component, reference the corresponding Figma frame name in a code comment: `// Figma: "Canvas / NodeView / Default"`. This keeps visual traceability without coupling the code to Figma at runtime.
5. Never hand-edit files in `DesignTokens/` — they are overwritten on every token-gen run.

---

## Coding Conventions

- **Swift 6 strict concurrency:** All `@MainActor`-isolated views; `FileSyncEngine` and `GitDiffWatcher` run on a dedicated `SerialExecutor`.
- **No third-party dependencies** outside Swift Package Manager. Approved packages: `swift-markdown` (Markdown parsing), `swift-yaml` (frontmatter parsing).
- **Preview-driven development:** Every `View` must have a `#Preview` that exercises both light and dark mode.
- **Naming:** Canvas types live in the `Canvas` module namespace; sync types in `Sync`. Avoid `Manager` suffix — prefer `Engine`, `Coordinator`, or `Handler`.
- **Tests:** Unit tests cover `FileSyncEngine` traversal logic and `ReadmeFrontmatter` parsing. Snapshot tests cover `NodeView` and `CanvasView` at 1× and 2× scale.
