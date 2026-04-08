---
name: File Sync
description: "The bridge between GUI canvas interactions and the filesystem, handling immediate file operations, maintaining the module index, and orchestrating on-demand LLM sync via git diff."
---

## Overview

File-sync is the layer that keeps the GUI and the filesystem in agreement. It sits between user interactions on the canvas and the files on disk, categorizing operations as immediate writes (deterministic, applied directly) or deferred writes (non-local effects requiring LLM sync). It also owns `.archui/index.yaml`, the GUI's fast-lookup table for UUID-to-path resolution.

## Write Strategy

Simple GUI actions — creating, renaming, or deleting a module, adding or removing a link, repositioning a node — are written immediately to disk with no LLM involvement. Operations with non-local effects, like moving a module to a new parent or bulk restructuring, are applied to disk first and then deferred to LLM sync for propagation. Full write tables and the LLM sync flow are in `resources/write-strategy.md`.

## `.archui/index.yaml`

The index is a flat lookup table mapping every module UUID to its current filesystem path, avoiding recursive directory walks on every navigation. File-sync performs incremental writes during GUI operations. The CLI's `archui index --fix` performs full rebuilds after batch edits or migrations. Both writers are valid; the index is committed to git as part of each sync.

## File Watching

File-sync uses OS-level file watching to detect external edits. On detecting a change to any README.md, it re-parses the frontmatter, emits a module-updated event to the canvas renderer, and updates the index for any new subfolders. This ensures the GUI stays live when the user edits files outside the GUI.
