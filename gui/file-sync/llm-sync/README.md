---
name: LLM Sync
description: "Defines the on-demand LLM sync flow that propagates non-local changes across the module graph using git diff as input, and the file-watching mechanism that keeps the GUI live during external edits."
---

## Overview

LLM sync is triggered on-demand — never automatically. It uses `git diff` to identify what changed since the last sync point, determines which other modules are affected by UUID references, and asks an LLM to produce a structured patch set. File-sync validates and applies the patches, then commits the result. The LLM is never given direct write access; all changes go through a human-reviewable git commit.

File-sync also maintains continuous file watching so the GUI canvas stays live during external edits. File watching re-parses frontmatter and emits events to the renderer but does not trigger LLM sync.

The full 7-step sync flow, error recovery behavior, and file watching OS details are in `resources/sync-flow.md`.
