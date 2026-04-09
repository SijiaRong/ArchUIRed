---
name: Rule Templates
description: "Platform-agnostic rule content templates that encode always-on constraints for AI coding agents — frontmatter restrictions, validation mandates, resources boundary — derived from core spec rules."
---

## Overview

Rule templates define the always-on constraints that every AI coding agent must follow when operating on an ArchUI project, regardless of which platform hosts the agent. Unlike skills (which are invoked for specific tasks), rules are loaded into every agent session unconditionally.

Templates are consumed by agent-specific adapter modules which format them according to each platform's rule/instruction mechanism.

## Template Categories

### Structural Constraints

- **Frontmatter purity** — Identity documents may only contain `name` and `description` in frontmatter. UUIDs, submodules, and links belong exclusively in `.archui/index.yaml`.
- **Folder-is-module** — Every folder is a module. Every module must have exactly one identity document. The only exception is `resources/`.
- **Submodule-disk sync** — The `submodules` map in `.archui/index.yaml` must exactly match the actual subfolders on disk, bidirectionally.
- **Module context loading** — Reading any identity document (`README.md`, `SPEC.md`, `SKILL.md`, `HARNESS.md`, `MEMORY.md`) requires also reading `.archui/index.yaml` in the same directory. A module's context is incomplete without its uuid, submodules, and links.

### Workflow Mandates

- **Validation after every change** — After any modification to spec files, run the CLI validator and fix all errors before proceeding. No exceptions.
- **Separate commits** — Spec changes and resources code changes must be committed separately.
- **Resources boundary** — Never read or modify `resources/` content unless the user explicitly authorizes it.

### Identity Constraints

- **UUID permanence** — A module's UUID never changes after creation, regardless of rename, move, or content edit.
- **Link-by-UUID** — Cross-module references use UUIDs, never file paths.

## Template Format

Each template is a Markdown file in `resources/` containing:

1. The constraint statement (what the agent must always do or never do)
2. Rationale (why this constraint exists)
3. Common violations and how to avoid them
