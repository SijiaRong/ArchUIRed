---
name: Conversion
description: "Orchestrates the AI-driven conversion of a non-ArchUI project into ArchUI format: agent invocation, module structure creation, original content preservation, and post-conversion validation."
---

## Overview

Conversion is the process of transforming an arbitrary project into a valid ArchUI module tree. It is executed by an AI agent — not by a mechanical rule engine — because determining meaningful module boundaries requires understanding the project's semantics, not just its file layout.

## AI Agent Requirement

Conversion requires an LLM agent with access to:
- The project filesystem (read/write)
- The `module-splitter` skill (for module boundary decisions)
- The ArchUI CLI validator (to verify the result)

The reference implementation invokes the Claude API directly from the ArchUI web app. The agent streams progress updates back to the UI. An API key must be configured in ArchUI settings before conversion can run.

Alternative: a user with Claude Code installed can run the `module-splitter` skill manually from the CLI, then trigger a project reload.

## Conversion Steps

### 1. Snapshot

Before any structural changes, verify the working tree is clean (done by `prerequisite-check`). The clean git state is the rollback point.

### 2. Project Analysis

The AI agent reads the project root and builds an understanding of:
- What the project does (from README, package.json, manifests, or equivalent)
- Top-level directory structure and file types
- Existing documentation, if any

### 3. Module Splitting

The agent applies the `module-splitter` skill to propose a module tree. See `module-splitter` for the splitting algorithm and decision criteria.

### 4. Structure Creation

For each proposed module, the agent:
1. Creates the module folder
2. Writes `README.md` with `name` and `description` derived from the project content
3. Writes `.archui/index.yaml` with a new UUID, submodules, and links
4. Creates `resources/original/` inside the module and moves the corresponding original files there

### 5. Root Module

The project root itself becomes the top-level ArchUI module. Its `README.md` describes the whole project. Its `.archui/index.yaml` lists all top-level submodules.

### 6. Validation

After structure creation, run:
```bash
archui validate .
```

If validation fails, the agent must fix all errors before reporting success. The conversion is not complete until the validator exits 0.

### 7. Git Commit

After a clean validation, stage all new ArchUI files and commit:
```
git add .
git commit -m "archui: convert project to ArchUI format"
```

Original files in `resources/original/` are included in this commit so the full conversion is atomic and reversible.

## Reversibility Contract

The conversion must be lossless. At any point after conversion, running:
```bash
find . -path "*/resources/original/*" -exec cp --parents {} /restore-target/ \;
```
must reconstruct the original project layout. No original file may be deleted — only moved into a `resources/original/` subfolder within its corresponding module.
