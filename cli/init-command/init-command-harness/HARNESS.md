---
name: Init Command Harness
description: Test harness for the CLI init command module.
---

## Overview

This harness verifies that `archui init` correctly initializes a project directory, detects AI agents, deploys all plugins, and produces the expected file structure. Tests use a `git worktree` from an existing repo as the disposable target so the environment is guaranteed clean.

## Prerequisites

- ArchUI CLI built at `cli/resources/dist/index.js`
- `expect` available (`which expect`)
- A git repo to create worktrees from (these tests use `software/web`)
- `claude` CLI command detected on PATH (for Claude Code plugin test)

## Playbook

### Group 1: Claude Code plugin — full install from scratch

[init]
Build the CLI from source:
```
cd cli/resources && npm run build
```
Create a clean worktree from `web/main`:
```
cd /path/to/software/web
git worktree add ../web-archui-test main
```
Confirm no `.archui` or `.claude` directory exists in the worktree.

[action]
Run `archui init` interactively via `expect`, selecting Claude Code (option 2):
```
expect -c '
set timeout 60
spawn node /path/to/ArchUIRed/cli/resources/dist/index.js init /path/to/web-archui-test

expect "Enter numbers to install"
send "2\r"

expect "press Enter to skip"
send "\r"

expect eof
'
```

[eval]
The terminal output must show:
- `→ Installing ArchUI plugin for Claude Code...`
- Each `==> Writing ...` line for all skill files
- `✓ Claude Code plugin installed`
- `Initialized ArchUI project: web-archui-test (uuid: <8-hex>)`

The following files must exist in the worktree:
```
.archui/index.yaml
.archui/layout.yaml
.claude/skills/archui-spec/SKILL.md
.claude/skills/archui-spec/rules/spec-format/README.md
.claude/skills/archui-spec/rules/uuid/README.md
.claude/skills/archui-spec/rules/validation/README.md
.claude/skills/archui-spec/rules/resources/README.md
.claude/skills/archui-spec/rules/commits/README.md
.claude/skills/archui-spec/rules/sync/README.md
.claude/skills/archui-spec/rules/context-loading/README.md
.claude/skills/archui-spec/commands/convert-project.md
.claude/skills/archui-docs/SKILL.md
.claude/skills/archui-docs/frontmatter-rules.md
.claude/skills/archui-docs/quality-checklist.md
.claude/skills/archui-docs/read-module.md
.claude/skills/archui-docs/read-spec.md
.claude/skills/archui-docs/write-harness.md
.claude/skills/archui-docs/write-memory.md
.claude/skills/archui-docs/write-readme.md
.claude/skills/archui-docs/write-spec.md
```

[end]
Remove the worktree:
```
cd /path/to/software/web
git worktree remove --force ../web-archui-test
```

---

### Group 2: Idempotency — re-running init on an already-initialized project

[init]
Ensure a project already has `.archui/index.yaml` (run Group 1 first, or use an existing initialized project).

[action]
Run `archui init <path> --skip-agents` a second time on the same path.

[eval]
The terminal output must show:
```
Already an ArchUI project (uuid: <8-hex>). Nothing to do.
```
No files must be modified (check `git status` shows no changes in the worktree).

[end]
No cleanup needed.

---

### Group 3: Re-run init when archui-spec is present but archui-docs is missing (sentinel check)

[init]
Create a clean worktree (same as Group 1 init step).
Manually create only the `archui-spec` sentinel file to simulate a partial prior install:
```
mkdir -p <worktree>/.claude/skills/archui-spec
touch <worktree>/.claude/skills/archui-spec/SKILL.md
```
Run `archui init <worktree> --skip-agents` to create `.archui/` first (so init does not exit early).

[action]
Run `archui init <worktree>` interactively again. Because `archui-docs/SKILL.md` is absent, the sentinel check must treat Claude Code as not fully installed and offer to install.

[eval]
The agent selection prompt must appear and offer Claude Code as an option.
After selecting Claude Code, both `archui-spec/SKILL.md` and `archui-docs/SKILL.md` must be present and non-empty.

[end]
Remove the worktree (same as Group 1 end step).
