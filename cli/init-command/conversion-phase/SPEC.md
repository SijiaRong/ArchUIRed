---
name: Conversion Phase
description: Two-step process that converts an existing project tree into a valid ArchUI structure by running a CLI pre-scan followed by a fully autonomous agent invocation.
---

## Overview

The conversion phase implements `archui init --convert`. It has two steps:

1. **CLI Pre-Scan (Step A)**: The CLI mechanically scans the project tree and writes `.archui/conversion-plan.yaml` — a structured inventory of candidate folders with inferred names, descriptions, and README states. This is fast, offline, and requires no agent.

2. **Agent Invocation (Step B)**: The CLI spawns the detected agent CLI (`claude` or `codex`) in fully autonomous mode, passing the conversion prompt from `.archui/commands/convert-project.md`. The agent reads the plan, applies the README merge rule, writes all ArchUI files, infers cross-module links, archives every non-spec file into the appropriate module's `resources/` directory (creating new modules if the decomposition is insufficiently granular), runs `archui validate`, and fixes any errors.

## Pre-Scan Algorithm

Scan the project tree up to `--depth` levels (default: 1).

**SKIP_DIRS** (never descend into): `node_modules`, `.git`, `.archui`, `resources`, `dist`, `build`, `.next`, `__pycache__`, `vendor`, `.cache`, `coverage`, `out`, `tmp`

For each candidate folder, record:
- `inferred_name`: `kebabToTitle(basename)` — e.g. `"my-module"` → `"My Module"`
- `inferred_description`: first non-empty body line from README.md, or `description` from package.json, or `"<name> module"`
- `already_converted`: `true` if `.archui/index.yaml` exists
- `readme_state`: `"missing"` | `"no-frontmatter"` | `"partial"` | `"complete"`
- `depth`: integer from project root

Write to `.archui/conversion-plan.yaml`.

## conversion-plan.yaml Schema

```yaml
schema_version: 1
generated_at: "<ISO timestamp>"
root: "<absolute path>"
depth: <n>
candidates:
  - path: "<relative path from root>"
    inferred_name: "<Title Case name>"
    inferred_description: "<one sentence>"
    already_converted: false
    readme_state: "missing" | "no-frontmatter" | "partial" | "complete"
    depth: <integer>
```

## README Merge Rule

| Situation | Action |
|---|---|
| No `README.md` exists | Create with frontmatter only (`name` + `description`) |
| `README.md` exists, no frontmatter (no leading `---`) | Prepend the frontmatter block; preserve existing body verbatim |
| `README.md` exists, frontmatter missing `name` or `description` | Patch only the missing fields into existing frontmatter |
| `README.md` exists, frontmatter has both fields | Leave untouched |

## Agent CLI Invocation Contract

The CLI spawns the agent with these flags to ensure fully autonomous, non-interactive execution:

**Claude Code:**
```
claude --dangerously-skip-permissions --verbose --add-dir <project-root> -p "<prompt-content>" --output-format stream-json
```

- `--dangerously-skip-permissions`: skips all permission confirmations
- `--verbose`: required when using `-p` with `--output-format stream-json`; prevents the CLI from rejecting the combination
- `--add-dir <project-root>`: grants file system access to the project
- `-p`: non-interactive print mode, exits on completion
- `--output-format stream-json`: emits NDJSON events as they arrive; enables real-time streaming output to the user
- Auth: Claude Code's own keychain/OAuth — ArchUI does not manage API keys

**Streaming output:** The CLI pipes Claude's stdout and parses each newline-delimited JSON event. Events of type `assistant` with `content[].type === "text"` are written directly to `process.stdout`, giving the user a live view of the agent's progress. All other event types (tool calls, tool results, system) are silently discarded. stderr is inherited directly.

**Codex:**
```
codex --full-auto "<prompt-content>"
```

Agent selection priority: Claude Code → Codex → none (graceful degradation).

## Graceful Degradation

If no agent CLI is detected, the CLI prints manual instructions and exits 0. The `conversion-plan.yaml` remains on disk for the user to invoke the agent manually.
