---
name: Command Templates
description: Platform-agnostic command templates that encode reusable agent workflows — including project conversion and module decomposition — for deployment to each supported agent's command directory.
---

## Overview

Command templates are the canonical, platform-neutral definitions of executable agent workflows. Each template is a `.md` file containing a structured prompt that an AI agent can execute autonomously when invoked from the GUI or CLI.

Commands differ from skills: skills encode background knowledge and rules (always-on context), while commands encode specific tasks with clear start and end conditions.

## Templates

`resources/convert-project.md` is the single source of truth used by both the CLI (`archui init --convert`, imported at esbuild build time) and each agent adapter's `deploy.sh` (copied at deploy time).

| Template | Purpose | Full prompt |
|---|---|---|
| `convert-project` | Converts an existing software project into a valid ArchUI-compliant module structure | [`resources/convert-project.md`](resources/convert-project.md) |

### convert-project

Guides an agent through a nine-step autonomous workflow: scan the project tree, create modules with frontmatter and `.archui/` metadata, infer cross-module links, archive non-spec files into `resources/` directories, validate until zero errors, then spawn parallel sub-agents for submodule completion, link completion, and documentation enrichment.

## Deployment

Each agent adapter's `deploy.sh` copies the relevant templates to the agent's command directory:

| Agent | Destination |
|---|---|
| Claude Code | `.claude/skills/archui-spec/commands/convert-project.md` |
| Cursor | `.cursor/skills/archui-spec/commands/convert-project.md` |
| Codex | Referenced in `AGENTS.md` as an available command |
| Copilot | Referenced in `.github/copilot-instructions.md` as an available command |
