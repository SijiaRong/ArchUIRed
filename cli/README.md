---
name: CLI
description: The ArchUI CLI is a validation and conformance-checking tool that verifies the filesystem still satisfies ArchUI structural rules after any agent or human edit.
---

## Overview

The CLI is a read-rarely, validate-often tool. Its primary job is to run after agent or human modifications to the ArchUI filesystem and confirm that the result is still conformant. It does not provide a browsing or reading interface; agents read module README files directly via the filesystem. The CLI exists solely to catch violations early.

A typical workflow looks like this: an agent edits several README files, adds a new module folder, or rewrites frontmatter. Before committing or continuing, `archui validate` is run. If it exits 0, the filesystem is clean. If it exits non-zero, the output lists each violation by file path and rule, and the agent or human fixes the problems before proceeding.

## What the CLI is NOT

The CLI is not a documentation browser, a search tool, or a primary access interface. Agents that need to read a module's description load the README.md directly. The CLI has no `read`, `show`, or `search` commands. Its command surface is intentionally narrow.

## Commands

```
archui validate [path]    Run all validators against [path] (default: cwd)
archui index --fix        Rebuild .archui/index.yaml from the live filesystem
archui sync [path]        Trigger on-demand LLM sync: collects git diff, builds impact set, applies LLM-generated patches
archui migrate [path]     Apply pending schema migrations to bring the project to the current schema version
archui new <name> [path]  Create a new module folder with a README.md stub and auto-generated UUID at [path]/<name>/
archui merge <src> <dst>  Merge one ArchUI project into another, detecting and prompting to resolve UUID collisions
archui run                Trigger any module command using the AI agent (see cli/run-command)
```

The `run` command accepts a module path or name and a command name, then invokes the AI agent with that command's skill document:

```bash
archui run --module web-development-release/web-dev --command update-resources
archui run -m web-dev -c update-resources --agent claude --model claude-opus-4-6
archui run --module gui/screens/canvas --list    # discover available commands
```

All commands exit 0 on success and non-zero on violations, inconsistencies, or failures.

## Design Principles

- **Filesystem is truth.** The CLI never writes module content. It only reads and reports.
- **Composable validators.** Each sub-validator in `validator/` can be invoked independently, making it easy to run only the check that is relevant.
- **Actionable output.** Every error message includes the file path and the specific rule that was violated, so fixes are unambiguous.
- **No hidden state.** The only persistent artifact the CLI produces is `.archui/index.yaml`, and that file is always regenerable from the filesystem.
