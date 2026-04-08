---
name: archui-spec
description: ArchUI architecture document modification workflow. Use when adding, changing, or removing ArchUI modules (README.md files with YAML frontmatter). Enforces filesystem rules, UUID management, and .archui/index.yaml sync.
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# ArchUI Spec Modification Workflow

This skill is the entry point for all ArchUI spec work. Load the rule documents below **on demand** based on what the task requires — do not load all of them upfront.

## Module Commands

Every module can expose executable commands. Commands are `.md` files located at:

```
<module-path>/.archui/commands/<command-name>.md
```

To discover what actions a module supports, list its `.archui/commands/` directory. Each file has a `name` (button label), `description` (what it does), and a body (skill instructions for the AI agent). When the user asks to run a command on a module, read the corresponding command file and follow its instructions.

---

## Rule Loading Guide

| Situation | Load |
|---|---|
| User mentions `resources/`, reports a bug, or asks to investigate code | [rules/resources/README.md](rules/resources/README.md) — **load first, before anything else** |
| Writing or editing any README.md or `.archui/index.yaml` | [rules/spec-format/README.md](rules/spec-format/README.md) |
| Creating a new module | [rules/uuid/README.md](rules/uuid/README.md) + [rules/spec-format/README.md](rules/spec-format/README.md) |
| After any spec change | [rules/validation/README.md](rules/validation/README.md) — mandatory, no exceptions |
| After resources/ code changes pass testing | [rules/sync/README.md](rules/sync/README.md) |
| Before or during a git commit | [rules/commits/README.md](rules/commits/README.md) |

---

## Workflow Steps

### Step 1 — Determine scope

Read the affected modules and their parent modules to understand current state:
- What modules are changing (added / renamed / moved / deleted)?
- What modules link TO or FROM the affected modules?
- Does the task involve `resources/`? → Load [rules/resources/README.md](rules/resources/README.md) immediately.

### Step 2 — Update README.md and .archui/index.yaml

Load [rules/spec-format/README.md](rules/spec-format/README.md) for the exact format rules.

### Step 3 — Generate UUIDs (new modules only)

Load [rules/uuid/README.md](rules/uuid/README.md) for generation and uniqueness rules.

### Step 4 — Validate (mandatory)

Load [rules/validation/README.md](rules/validation/README.md). Run the validator. Fix all errors before proceeding.

### Step 5 — Sync spec after resources changes

If the task involved resources/ code changes, load [rules/sync/README.md](rules/sync/README.md) and apply the sync workflow.

### Step 6 — Commit

Load [rules/commits/README.md](rules/commits/README.md). Spec and resources commits must be separate.

---

## Quick reference — relation vocabulary

| relation | meaning |
|---|---|
| `depends-on` | this module needs the other to function |
| `implements` | this module is a concrete implementation of the other |
| `extends` | this module builds on the other |
| `references` | informational reference |
| `related-to` | loosely related, no strict dependency |
