---
name: GUI
description: "A node-based infinite canvas where knowledge modules appear as visual nodes that users can drag, link, and drill into across Web, Electron, iOS, and Android platforms."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

The GUI is ArchUI's human-facing interface: a node-based infinite canvas (in the style of [ComfyUI](https://github.com/comfyanonymous/ComfyUI)) where the knowledge base is rendered as a hierarchy of visual cards. Each canvas level shows one focused module as a large primary card (containing its name, UUID, description, and submodule ports) surrounded by small external reference cards for linked modules outside the hierarchy, connected by directional link edges. Users navigate the knowledge graph by panning and zooming the canvas, drilling into submodules to make them the new primary card, and drawing edges between cards to create cross-module links.

The GUI does not own the data. The filesystem is always the source of truth. The GUI reads from and writes to the filesystem directly for structurally simple operations (creating a folder, editing frontmatter). For complex propagation — such as renaming a module referenced by UUID from many other files — the user triggers an on-demand LLM sync that receives the git diff and updates all affected files.

## Architecture

The GUI is implemented separately for each target platform: Web (React + canvas rendering), Electron (Web implementation with local filesystem access), iOS (native SwiftUI canvas with Metal rendering), and Android (native Jetpack Compose canvas with custom drawing). All platforms conform to the same ArchUI filesystem spec defined in `core` and share a single Figma design source of truth.

That shared design source now includes both token foundations and workspace orchestration rules, so large visual refactors can be staged semantically before platform code is touched.

## Key Principles

The canvas is cosmetic; the filesystem is canonical. Card positions are stored as display hints in `.archui/layout.yaml` and do not affect the module hierarchy. Human edits to README.md files are first-class — the GUI detects changes via file-watching and re-renders affected cards with no "GUI mode" lock. LLM sync is on-demand, keeping the LLM out of the hot path and giving humans control over when AI assistance is applied.

## Submodules

- **screens** — Top-level screen modules (landing, canvas with idle/node-selected/drilled states).
- **components** — Reusable visual components: module-node, link-renderer, navigation.
- **file-sync** — Bridge between GUI interactions and filesystem state, including git-diff-driven LLM sync.
- **design-system** — Visual design specifications maintained in Figma, consumed by all platform implementations.
- **design-update-trigger** — Detects design-affecting spec changes and orchestrates the Figma sync → code regeneration → screenshot verification pipeline.
