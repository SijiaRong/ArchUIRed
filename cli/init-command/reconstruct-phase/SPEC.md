---
name: Reconstruct Phase
description: Two-step process that deconstructs an existing project and rebuilds it as a clean ArchUI module tree by running a backup phase followed by a fully autonomous multi-agent reconstruction.
---

## Overview

The reconstruct phase implements `archui init --reconstruct`. Unlike `--convert` (which layers ArchUI metadata onto the existing directory layout), `--reconstruct` tears down the original structure and rebuilds it from scratch as a properly decomposed module tree.

## Step 1: Backup Phase

The CLI performs a synchronous, offline backup before any agent involvement:

1. Copy the entire project tree (excluding `SKIP_DIRS`) into `.archui-backup/` — this is a read-only safety copy that must never be modified.
2. Copy the same tree into `.archui-temp/` — a working copy that the agent will read from and relocate files out of.
3. Remove all original files from the working tree, leaving only `.archui/`, `README.md`, `.archui-backup/`, and `.archui-temp/`.

The backup phase prints file counts for both copies and confirms the working tree is clean before proceeding.

## Step 2: Agent Invocation

The CLI spawns the detected agent (`claude` or `codex`) in fully autonomous mode, passing the `reconstruct-project.md` prompt template from `core/agent-config/command-templates/resources/`. The agent executes phases 2 through 7 of the reconstruction workflow (parallel analysis, module design, split validation, file relocation, ArchUI scaffolding, and validation loop).

During this step the `agent-invocation` module's progress feedback (spinner with elapsed time, tool name display) keeps the user informed while the agent works.

## Reversibility Contract

Every original file in `.archui-backup/` must end up in exactly one module's `resources/` directory after reconstruction. The agent verifies this in its final validation phase. If reconstruction fails, `.archui-backup/` is preserved and the user can manually restore.

## Graceful Degradation

If no agent CLI is detected, the CLI prints manual instructions and exits 0. The `.archui-backup/` and `.archui-temp/` directories remain on disk for manual agent invocation.
