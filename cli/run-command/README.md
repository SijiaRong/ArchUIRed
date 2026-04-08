---
name: CLI Run Command
description: "The `archui run` command that triggers any module command from the terminal — resolves the target module, loads the command's skill document, invokes the AI agent with streaming stdout output, and exits with the agent's result code."
---

## Overview

`archui run` bridges the CLI and the module command system. It reads a command's `.md` skill file, invokes the configured AI agent with that skill, streams progress to stdout, and exits non-zero on failure.

This enables commands authored for the GUI (e.g. `update-resources`) to be triggered from a terminal, CI pipeline, or agent orchestrator without opening the web app.

## Command Syntax

```
archui run --module <path-or-name> --command <command-name> [options]

Options:
  --module, -m   <path>    Module path relative to project root, or module name
                           (resolved by searching .archui/index.yaml)
  --command, -c  <name>    Command filename without .md extension
  --agent, -a    <name>    Agent provider: "claude" (default) | "openai" | "custom"
  --model        <id>      Model ID override (e.g. claude-opus-4-6, gpt-4o)
  --api-key      <key>     API key (default: env var, see below)
  --base-url     <url>     Custom API base URL (for OpenAI-compatible providers)
  --project      <path>    Project root (default: cwd)
  --dry-run                Print the resolved skill body without invoking the agent
  --list                   List available commands for the resolved module and exit
```

### Examples

```bash
# Run update-resources on the web-dev module (default agent: claude)
archui run --module web-development-release/web-dev --command update-resources

# Same, using a short module name resolved from the index
archui run -m web-dev -c update-resources

# Use a specific model
archui run -m web-dev -c update-resources --model claude-opus-4-6

# List all commands available on a module
archui run --module web-dev --list

# Preview the skill that would be sent to the agent
archui run -m web-dev -c update-resources --dry-run
```

## Module Resolution

`--module` accepts two forms:

1. **Path** (preferred) — relative to project root. Matched exactly against the filesystem.
   ```
   web-development-release/web-dev
   gui/components/module-node/default
   ```

2. **Name** — the module's `name` field from its README.md frontmatter. Resolved by scanning all modules in `archui/index.yaml` (or building a name→path map at runtime).
   - If a name matches more than one module, the command exits with an error listing all matches and asks the user to use a path instead.
   - Name matching is case-insensitive.

## Command Discovery

Given a resolved module path, the command file is located at:

```
<module-path>/.archui/commands/<command-name>.md
```

`--list` enumerates `<module-path>/.archui/commands/*.md` and prints each command's `name` and `description` from its frontmatter, then exits 0.

If no `.archui/commands/` directory exists, `--list` prints "(no commands)" and exits 0.

If the specified `--command` file does not exist, the CLI exits 1 with a message listing available commands.

## Agent Configuration

All configuration is optional. Resolution order (highest priority first):

### API key

| Priority | Source |
|---|---|
| 1 | `--api-key` flag |
| 2 | `ANTHROPIC_API_KEY` env var (when agent is claude) |
| 2 | `OPENAI_API_KEY` env var (when agent is openai) |
| 3 | `api_key` field in `~/.archui/config.yaml` |

If no API key is found, the command exits 1 with a clear error and a hint to set the env var.

### Agent and model

| Priority | Source |
|---|---|
| 1 | `--agent` / `--model` flags |
| 2 | `default_agent` / `default_model` in `~/.archui/config.yaml` |
| 3 | Built-in defaults (claude / claude-sonnet-4-6) |

### `~/.archui/config.yaml` (optional)

All fields are optional. Unset fields fall back to built-in defaults.

```yaml
# ~/.archui/config.yaml
default_agent: claude         # claude | openai | custom
default_model: claude-opus-4-6
base_url: ~                   # leave blank for standard endpoints
api_key: ~                    # prefer env var; set here only if env var is inconvenient
```

Built-in provider defaults (used when neither flag nor config sets them):

| Agent | Default model | Default endpoint |
|---|---|---|
| `claude` | `claude-sonnet-4-6` | `https://api.anthropic.com` |
| `openai` | `gpt-4o` | `https://api.openai.com` |
| `custom` | (must be set via flag or config) | (must be set via flag or config) |

## Agent Invocation — Working Directory

When the agent is Claude Code (`--agent claude`), `archui run` spawns it with:

```
cwd  = <project-root>/<module-path>
args = --add-dir <project-root>
task = <expanded skill body>   (passed via -p / --print flag for non-interactive mode)
```

**Why `cwd = module path`:**
Claude Code uses its working directory as the active project root. Starting from the module folder means:
- Claude Code's file tools default to the module subtree
- Any `./resources/` writes go into the correct module resources folder
- The agent's mental model of "the project" is scoped to the module

**Why `--add-dir <project-root>`:**
The module needs read access outside its own folder:
- Linked modules' READMEs (for context)
- Skill documents at `<project-root>/.claude/skills/`
- Running `node <project-root>/cli/resources/dist/index.js validate <project-root>` for validation

`--add-dir` extends Claude Code's read access without changing its working root.

**CLAUDE.md auto-discovery:**
Claude Code traverses from `cwd` upward, loading every `CLAUDE.md` it finds. Starting from `web-development-release/web-dev/`, it will load:

```
web-development-release/web-dev/CLAUDE.md   ← module-level (if present)
web-development-release/CLAUDE.md           ← intermediate (if present)
<project-root>/CLAUDE.md                    ← always found: ArchUI project rules
```

This means the project-level ArchUI rules reach the agent automatically — no extra flag needed.

## Module-Level CLAUDE.md

A module may place a `CLAUDE.md` at its root to provide module-specific context to the agent when `archui run` targets it:

```
web-development-release/web-dev/
├── CLAUDE.md          ← loaded by Claude Code when cwd = this folder
├── README.md
├── .archui/
└── resources/
```

A module `CLAUDE.md` typically contains:
- The module's write boundary: "Only write to `web-development-release/web-dev/resources/`"
- Absolute path to the validator for this project
- Any module-specific conventions the agent must follow

Example:

```markdown
# Web Dev Module

You are working inside the `web-development-release/web-dev` module.

## Write boundary
Only write files under `web-development-release/web-dev/resources/`.
Do not modify README.md, .archui/index.yaml, or any file in a sibling module.

## Validator
After any write, run: node /absolute/path/to/cli/resources/dist/index.js validate /absolute/path/to/project-root

## Skill location
ArchUI skills are at: /absolute/path/to/project-root/.claude/skills/
```

`CLAUDE.md` is not an ArchUI structural file — it is not validated by `archui validate` and does not replace README.md. It is a Claude Code instruction file that coexists with the module's ArchUI files.

## Skill Loading

The command file body is loaded and passed to the agent as the task skill. Before sending:

1. `{{module.path}}` in the body is replaced with the resolved module path.
2. `{{module.name}}` is replaced with the module's name from its README.md frontmatter.
3. `{{project.root}}` is replaced with the absolute path to the project root.
4. The task prompt includes: the command body, the module's README.md, and the READMEs of all directly linked modules (same as `core/ai-agent/skill-loader` behaviour).

## Streaming Output

Progress is streamed to stdout in real time:

```
[archui run] Module: web-development-release/web-dev
[archui run] Command: update-resources
[archui run] Agent: claude (claude-sonnet-4-6)
[archui run] ──────────────────────────────────────────
Reading web-dev README...
Building implements graph...
Phase 0: Reversibility check — 5 modules
  ✓ filesystem-adapters/fsa-adapter
  ✓ filesystem-adapters/mem-adapter
  ✓ filesystem-adapters/server-adapter
  ✓ filesystem-adapters
  ✓ web-dev
Phase 2: Generating fsa-adapter resources...
  write: fsa-adapter/resources/src/filesystem/fsa.ts
...
[archui run] ✓ Done
```

Text tokens from the model are printed as-is. Tool calls are summarised as `  write: <path>` or `  read: <path>`. The `──` separator marks where agent output begins.

## Exit Codes

| Code | Meaning |
|---|---|
| 0 | Agent completed successfully |
| 1 | Configuration error (missing module, command, API key) |
| 2 | Agent reported task failure |
| 3 | Agent exceeded safety limits (tool call limit, etc.) |
| 4 | Validator failed after agent finished |

## Relation to GUI Commands

`archui run` and the GUI command buttons share the same skill documents — the same `.archui/commands/*.md` file is used in both contexts. The only difference is the execution environment:

| Context | Skill loader | Tool executor | Output |
|---|---|---|---|
| GUI | `core/ai-agent/skill-loader` | `core/ai-agent/task-runner` | streaming panel |
| CLI | `cli/run-command` | same task-runner logic | stdout |

This guarantees that `archui run -m web-dev -c update-resources` and clicking the GUI button produce identical agent behaviour.
