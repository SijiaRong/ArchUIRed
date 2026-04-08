---
name: Android Development
description: "Covers the Jetpack Compose implementation of the ArchUI canvas, Android filesystem access via SAF, Figma MCP-driven UI implementation, and local development conventions for the Android agent."
---

## Overview

This module describes how an Android agent works on the ArchUI native application. The app is written in Kotlin with Jetpack Compose as the sole UI toolkit. There is no XML layout, no View system interop beyond what Compose itself requires, and no WebView. Every pixel is owned by Compose.

## Pre-Build Validation

Before compiling or deploying, always run the ArchUI CLI validator to ensure the module tree conforms to the filesystem rules:

```bash
archui validate .
```

If validation reports any `ERROR`, fix all issues before proceeding with the build. Do not compile or deploy against a structurally invalid module tree.

## Local Development Setup

**Prerequisites:**
- Android Studio Hedgehog (2023.1.1) or newer — use the latest stable channel
- JDK 17 (bundled with Android Studio; do not override with a system JDK unless necessary)
- Android SDK: compile SDK 35, min SDK 26
- An Android device or emulator running API 26+

**Project structure (Gradle):**
```
app/
  src/main/kotlin/com/archui/
    canvas/          # ArchUICanvas composable and related drawing logic
    nodes/           # Module node composables
    navigation/      # NavHost setup and deep-link handling
    filesystem/      # SAF-based ArchUI tree reader
    sync/            # File-sync / LLM-sync integration
    theme/           # MaterialTheme tokens derived from design-system
    MainActivity.kt
```

Run `./gradlew assembleDebug` to verify the build before making UI changes.

## Canvas Implementation

The ArchUI canvas is implemented as a Compose `Canvas` composable wrapped in a `Box` with `pointerInput` modifiers for gesture detection.

**Pan and zoom:**
```kotlin
var offset by remember { mutableStateOf(Offset.Zero) }
var scale by remember { mutableStateOf(1f) }

Box(
    Modifier
        .fillMaxSize()
        .pointerInput(Unit) {
            detectTransformGestures { _, pan, zoom, _ ->
                scale = (scale * zoom).coerceIn(0.2f, 4f)
                offset += pan
            }
        }
) {
    Canvas(Modifier.fillMaxSize()) {
        withTransform({
            translate(offset.x, offset.y)
            scale(scale, scale, pivot = Offset.Zero)
        }) {
            // draw module nodes
        }
    }
}
```

Each module node is a `@Composable` function that receives a `ModuleNode` data class (uuid, name, description, position) and renders a rounded-rect card. Tapping a node triggers drill-down via `NavController.navigate("module/${node.uuid}")`.

**Navigation:**
Drill-down uses Jetpack Navigation Compose. The `NavHost` defines two destinations: `canvas/{moduleUuid}` for the canvas view of any module, and `readme/{moduleUuid}` for the full README reader. The back stack naturally supports the up-hierarchy navigation pattern.

```kotlin
NavHost(navController, startDestination = "canvas/root") {
    composable("canvas/{moduleUuid}") { backStackEntry ->
        ArchUICanvas(moduleUuid = backStackEntry.arguments?.getString("moduleUuid") ?: "root")
    }
    composable("readme/{moduleUuid}") { backStackEntry ->
        ReadmeViewer(moduleUuid = backStackEntry.arguments?.getString("moduleUuid") ?: "root")
    }
}
```

## Filesystem Access (SAF / Scoped Storage)

Android's Scoped Storage means the app cannot freely read arbitrary paths. The user must grant a persistent URI permission to the root ArchUI directory using `ACTION_OPEN_DOCUMENT_TREE`. The granted URI is persisted via `contentResolver.takePersistableUriPermission`.

The `ArchUITreeReader` class in `filesystem/` recursively walks the granted tree using `DocumentFile.fromTreeUri`. For each directory it finds:
1. Checks for a `README.md` child document.
2. Reads the README via an `InputStream` from `contentResolver.openInputStream(uri)`.
3. Parses YAML frontmatter (between `---` delimiters) using a lightweight in-process YAML parser (no external dependency — use a regex-split + line-by-line key:value scan for the fields defined in `core/readme-schema`).
4. Skips any directory named `resources` per the ArchUI filesystem rules.

The parsed tree is exposed as a `StateFlow<ModuleTree>` that the canvas observes. Changes on disk (e.g. after a git pull or LLM sync) are picked up on the next manual refresh or when the app resumes.

## File-Sync / LLM-Sync Integration

ArchUI uses a git-diff-based file-sync approach where an agent on another device (or the CLI) pushes README changes and the Android app pulls them. The `sync/` package handles:

- **Pull trigger:** The user taps "Sync" in the app, which calls the sync agent endpoint (configured in app settings) to run `git pull` on the ArchUI repo path.
- **LLM sync:** For on-demand summarization or README generation, the app sends a diff payload to the CLI agent via a local HTTP endpoint (or shares it to the ArchUI CLI companion app). The response is written back to the appropriate README.md.

The sync layer is intentionally thin — the app is a reader/renderer first, and delegates heavy LLM work to the CLI or desktop agent.

## Figma MCP Integration

Design tokens and component specs are consumed from Figma via the Figma MCP tool, which is available to the Android agent during development sessions. Workflow:

1. Open the ArchUI Figma file (link stored in `gui/design-system`).
2. Use Figma MCP to extract color styles, text styles, and spacing variables.
3. Map them to the Compose `MaterialTheme` extensions in `theme/ArchUITheme.kt`.
4. Never hardcode color hex values or font sizes in composables — always reference theme tokens.

When implementing a new screen or component, pull the relevant Figma frame first, confirm the design with the design-system spec, then write the Composable.

## Coding Conventions

- **Kotlin style:** Follow the official Kotlin coding conventions. Use `data class` for all model types. Prefer `sealed class` over `enum` for state hierarchies.
- **Composable naming:** Composables are PascalCase. Preview composables are suffixed `Preview` and annotated `@Preview(showBackground = true)`.
- **State hoisting:** All UI state is hoisted to the nearest `ViewModel`. Composables receive state and callbacks only — no direct ViewModel references inside leaf composables.
- **No side effects in composition:** Use `LaunchedEffect`, `SideEffect`, or `DisposableEffect` for any imperative work triggered from composition.
- **Testing:** Each ViewModel has a unit test. Each non-trivial Composable has a `composeTestRule`-based UI test. Aim for 80%+ coverage on `canvas/` and `nodes/` packages.
- **Lint:** `./gradlew lint` must pass with zero errors before opening a PR. Warnings are reviewed but not blocking.
