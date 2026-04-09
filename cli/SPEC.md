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
archui validate [path]              Run all validators against [path] (default: cwd)
archui validate --level <1|2|3>     Validate up to a specific conformance level only
archui index --fix                  Rebuild .archui/index.yaml from the live filesystem
archui sync [path]                  Trigger on-demand LLM sync: collects git diff, builds impact set, applies LLM-generated patches
archui migrate [path]               Apply pending schema migrations to bring the project to the current schema version
archui new <name> [path]            Create a new module folder with a README.md stub and auto-generated UUID at [path]/<name>/
archui merge <src> <dst>            Merge one ArchUI project into another, detecting and prompting to resolve UUID collisions
archui init [path]                  Initialize a new ArchUI project at [path] by creating root README.md and .archui/index.yaml
archui import [path] --analyze      Scan an existing project and report its current conformance level
archui import [path] --preview      Preview what --apply would create, without writing anything
archui import [path] --apply        Convert an existing project to ArchUI format (use --partial for L0→L2, --deepen for L2→L3)
archui run                          Trigger any module command using the AI agent (see cli/run-command)
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

## Installation

### During development — `npm link`

Use `npm link` to register the CLI as a global command on your local machine. The symlink points directly to the source directory, so changes to `cli/resources/src/` take effect immediately after rebuilding without reinstalling.

```bash
cd cli/resources
npm install
npm run build
npm link
```

After linking, `archui` is available globally on your machine:

```bash
archui validate .
```

To unlink: `npm unlink archui`

### For distribution — publish to npm

When the CLI is stable and ready for others to use, publish to npm so any engineer can install it without cloning this repository.

```bash
cd cli/resources
npm publish
```

Anyone can then install it globally:

```bash
npm install -g archui
archui validate .
```

Each publish requires a version bump in `package.json`. Published versions are immutable — use `npm version patch|minor|major` before publishing.
