#!/usr/bin/env bash
set -euo pipefail

# deploy.sh — Cursor adapter deployment script (embedded in the CLI)
# Executed by `archui init` with cwd set to the target project root.
#
# Generates .cursor/skills/ and .cursor/rules/ with ArchUI agent instructions.
# Idempotent: re-running overwrites deployed files with canonical content.

echo "==> Deploying Cursor adapter files..."

# ---------------------------------------------------------------------------
# Skill: .cursor/skills/archui-spec/SKILL.md
# ---------------------------------------------------------------------------

mkdir -p .cursor/skills/archui-spec

echo "--> Writing .cursor/skills/archui-spec/SKILL.md"
cat > .cursor/skills/archui-spec/SKILL.md << 'EOF'
---
name: archui-spec
description: ArchUI architecture document modification workflow. Use when adding, changing, or removing ArchUI modules (README.md files with YAML frontmatter). Enforces filesystem rules, UUID management, and .archui/index.yaml sync.
---

# ArchUI Spec Modification Workflow

Always-on rules (loaded automatically via `.cursor/rules/`) apply throughout. This skill covers the step-by-step workflow for spec changes.

## Module Commands

Every module can expose executable commands at `<module-path>/.archui/commands/<command-name>.md`. List that directory to discover what actions a module supports. When the user asks to run a command on a module, read the corresponding command file and follow its instructions.

---

## Workflow Steps

### Step 1 — Determine scope

Read the affected modules and their parent modules to understand current state:
- What modules are changing (added / renamed / moved / deleted)?
- What modules link TO or FROM the affected modules?
- Does the task involve `resources/`? → Stop — load `resources-boundary` rule before proceeding.

### Step 2 — Update README.md and .archui/index.yaml

Identity document rules (from `frontmatter-purity` rule):
- Only `name` and `description` fields in frontmatter
- No `uuid`, `submodules`, `links`, or any other structural field
- UUID and links belong in `.archui/index.yaml`

`.archui/index.yaml` format:
```yaml
schema_version: 1
uuid: <stable 8-hex UUID — never change after creation>
submodules:             # folder-name → child uuid (must match actual subfolders)
  folder-name-a: <uuid-a>
links:
  - uuid: <target module UUID>
    relation: depends-on   # depends-on | implements | extends | references | related-to
    description: Optional clarification
```

### Step 3 — Generate UUIDs (new modules only)

```bash
openssl rand -hex 4
```

Check uniqueness before using:
```bash
grep -r "<generated-uuid>" . --include="*.yaml"
```

UUID rules: 8 lowercase hex characters only. Never RFC 4122 format. Never changes after creation.

### Step 4 — Validate (mandatory)

```bash
node cli/resources/dist/index.js validate .
```

Fix ALL errors before proceeding. Warnings are advisory.

### Step 5 — Sync spec after resources changes

If the task involved `resources/` code changes that passed testing, update affected spec modules bottom-up. Start from the innermost changed module, work upward until all ancestors are accurate.

### Step 6 — Commit

Spec and resources must be separate commits:
- `spec:` prefix — touches only `README.md` and `.archui/index.yaml`
- Platform prefix (`web:`, `ios:`, `android:`, `cli:`) — touches only `resources/`

Spec commit first, resources commit second.

---

## Quick reference — relation vocabulary

| relation | meaning |
|---|---|
| `depends-on` | this module needs the other to function |
| `implements` | this module is a concrete implementation of the other |
| `extends` | this module builds on the other |
| `references` | informational reference |
| `related-to` | loosely related, no strict dependency |
EOF

# ---------------------------------------------------------------------------
# Rule: .cursor/rules/frontmatter-purity.md
# ---------------------------------------------------------------------------

mkdir -p .cursor/rules

echo "--> Writing .cursor/rules/frontmatter-purity.md"
cat > .cursor/rules/frontmatter-purity.md << 'EOF'
# Frontmatter Purity

## Rule

Identity documents (`README.md`, `SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`) may contain **only two frontmatter fields**: `name` and `description`.

```yaml
---
name: Human-readable module name
description: One-sentence summary of this module's purpose
---
```

## Forbidden fields

`uuid`, `submodules`, `links`, `layout`, and any other structural field are **not allowed** in frontmatter. They belong in `.archui/index.yaml`.

| Field | Where it lives |
|---|---|
| `uuid` | `.archui/index.yaml` |
| `submodules` | `.archui/index.yaml` |
| `links` | `.archui/index.yaml` |
| `layout` | `.archui/layout.yaml` |

## Description rule

`description` must be a **single, declarative, self-contained sentence**. It is always loaded into agent context — keep it precise and under one line.

## Common violations

- Copying a `uuid` into a README.md frontmatter block
- Adding a `links:` array to an identity document instead of `.archui/index.yaml`
- Writing a multi-sentence or multi-paragraph description
EOF

# ---------------------------------------------------------------------------
# Rule: .cursor/rules/validation-mandate.md
# ---------------------------------------------------------------------------

echo "--> Writing .cursor/rules/validation-mandate.md"
cat > .cursor/rules/validation-mandate.md << 'EOF'
# Validation Mandate

## Rule

Run the CLI validator after **every** change to ArchUI spec files. No exceptions.

```bash
node cli/resources/dist/index.js validate .
```

If the built CLI is unavailable, rebuild first:

```bash
cd cli/resources && npm run build
node cli/resources/dist/index.js validate .
```

## Reading output

- `ERROR` — blocking; fix all errors before proceeding
- `WARN` — advisory; acceptable but note them

## Common errors

| Error code | Meaning | Fix |
|---|---|---|
| `links/dangling-uuid` | A link targets a UUID not found in the project | Remove the link or add the missing module |
| `archui/undeclared-subfolder` | A subfolder exists but is not in `.archui/index.yaml` submodules | Add it to the parent's submodules map |
| `archui/submodule-not-found` | submodules map references a folder or UUID that doesn't exist | Remove the entry or create the missing folder |
| `frontmatter/missing-field` | README.md is missing `name` or `description` | Add the missing field |
| `archui/missing-file` | `.archui/index.yaml` not found | Create it with `schema_version: 1` and a `uuid` |
| `spec/missing-harness` | SPEC module has no HARNESS submodule | Add a `<name>-harness/` subfolder with a `HARNESS.md` |

## Never skip validation

If validation fails, return to the relevant step and fix. Never commit while errors are present.
EOF

# ---------------------------------------------------------------------------
# Rule: .cursor/rules/resources-boundary.md
# ---------------------------------------------------------------------------

echo "--> Writing .cursor/rules/resources-boundary.md"
cat > .cursor/rules/resources-boundary.md << 'EOF'
# Resources Boundary

## Rule

**Never read or modify any `resources/` folder content unless the user explicitly says so.**

"Explicitly" means the user's message contains words like: fix, update, modify, change, implement, build, rebuild, generate — AND the target is clearly `resources/` code (not spec files).

## Before touching resources/

1. Read the relevant module README.md files first (spec level)
2. Check if the spec is complete — an incomplete spec may be the root cause
3. Only after spec analysis, if resources/ code must be changed, proceed if the user explicitly authorized it

## Allowed without asking

- Reading module README.md and `.archui/index.yaml` files
- Running the CLI validator
- Running `git diff` / `git log`

## Requires explicit user authorization

- Reading any file inside `resources/`
- Modifying any file inside `resources/`
- Running `npm run build` or any build command

## When the user reports a bug

1. Read the relevant spec modules first
2. Run `archui validate .`
3. If spec is valid → tell the user the issue is in resources/, ask if they want you to investigate there
4. If spec is incomplete → fix the spec first
EOF

# ---------------------------------------------------------------------------
# Rule: .cursor/rules/uuid-permanence.md
# ---------------------------------------------------------------------------

echo "--> Writing .cursor/rules/uuid-permanence.md"
cat > .cursor/rules/uuid-permanence.md << 'EOF'
# UUID Permanence

## Rule

A module's UUID **never changes** after creation — not on rename, not on move, not on content edit.

## Format

8 lowercase hex characters. Examples: `93ab33c4`, `7e3f1c9a`.

**Never use full RFC 4122 UUIDs** (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

## Generating a new UUID

```bash
openssl rand -hex 4
```

Check uniqueness before using:
```bash
grep -r "<generated-uuid>" . --include="*.yaml"
```

If found, generate a new one.

## Additional rules

- Never reuse UUIDs from deleted modules
- UUIDs must be unique across the entire project
- Cross-module links reference UUIDs, not file paths — UUIDs remain valid after renames/moves

## YAML quoting

Some valid 8-hex strings are misread by YAML parsers. Always quote UUIDs that could be misread:

```yaml
uuid: "785e2416"   # quoted — looks like scientific notation otherwise
```

When in doubt, quote it.
EOF

# ---------------------------------------------------------------------------
# Rule: .cursor/rules/module-context-loading.md
# ---------------------------------------------------------------------------

echo "--> Writing .cursor/rules/module-context-loading.md"
cat > .cursor/rules/module-context-loading.md << 'EOF'
# Module Context Loading

## Rule

When reading any module's identity document (`README.md`, `SPEC.md`, `SKILL.md`, `HARNESS.md`, `MEMORY.md`), you **must also read** `.archui/index.yaml` in the same directory. A module's context is not complete until both files have been read.

## Why

Identity documents contain only `name` and `description`. The structural half of a module — its `uuid`, `submodules` (child modules), and `links` (cross-module dependencies) — lives exclusively in `.archui/index.yaml`. Skipping it means you are missing:

- **uuid** — needed to identify this module in links from other modules
- **submodules** — the list of child modules this module contains
- **links** — what other modules this module depends on, implements, or extends

## When this applies

Every time you read a module to understand it, modify it, or reason about its relationships. There are no exceptions.

## Common violations

- Reading `SPEC.md` and starting to edit without checking what the module links to
- Answering "what does this module depend on?" from the identity document body alone
- Creating a new link without first reading `index.yaml` to check existing links
EOF

# ---------------------------------------------------------------------------
# Skill: .cursor/skills/archui-docs/SKILL.md
# ---------------------------------------------------------------------------

mkdir -p .cursor/skills/archui-docs

echo "--> Writing .cursor/skills/archui-docs/SKILL.md"
cat > .cursor/skills/archui-docs/SKILL.md << 'EOF'
---
name: archui-docs
description: "ArchUI identity document authoring and reading skill. Use when creating, modifying, or reading any ArchUI identity document (SPEC.md, HARNESS.md, MEMORY.md, SKILL.md, README.md). Teaches document structure, quality standards, and efficient reading strategies."
---

# ArchUI Identity Document Authoring & Reading

Load this skill when **creating, modifying, or reading** any ArchUI identity document (`SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`, `README.md`). It teaches document structure, quality standards, and efficient reading strategies.

This skill complements `archui-spec` (structural workflow) — `archui-spec` covers *how to create/move/link modules*; this skill covers *how to write and read the prose inside them*.

---

## Frontmatter Rules (all document types)

Every identity document uses the same frontmatter schema — **two fields only**:

```yaml
---
name: Human-Readable Module Name
description: One declarative sentence describing the module's purpose.
---
```

**Forbidden in frontmatter:** `uuid`, `submodules`, `links`, `layout`, or any other field.

### Description Field

The `description` is always loaded into agent context. It must be:

- **One sentence** — multi-sentence triggers a validation warning
- **Declarative** — states what the module *does*, not what it *contains*
- **Self-contained** — understandable without reading the body
- **Present tense** — "Validates filesystem structure" not "Will validate..."

---

## Writing SPEC.md

A SPEC defines an implementation specification — a module with `resources/` that implements something. Every SPEC must have exactly one HARNESS submodule.

### Required Sections

- **Overview** — What this module does, why it exists — 2–4 sentences
- **Design** — Key design decisions, constraints — 3–6 sentences
- **Sub-modules** — One sentence per direct child (omit if none)
- **Dependencies** — One sentence per link (omit if none)

## Writing HARNESS.md

A HARNESS is a test playbook for its parent SPEC. Exactly one link to parent SPEC with `relation: implements`.

### Required Sections

- **Overview** — What this harness tests — 2–3 sentences
- **Playbook** — Test groups using `[init]`/`[action]`/`[eval]`/`[end]` markers

## Writing MEMORY.md

A MEMORY records accumulated knowledge for its parent SPEC. Links only to parent SPEC.

### Required Sections

- **Overview** — What knowledge is recorded — 2–3 sentences
- **Observations** — Timestamped, append-only entries

## Writing README.md

A README is the generic fallback. Used for organizational modules without `resources/`.

### Required Sections

- **Overview** — What this module represents — 2–4 sentences
- **Sub-modules** — One sentence per child (omit if none)
- **Dependencies** — One sentence per link (omit if none)

---

## Content Quality Rules

1. Third-person present tense: "This module validates..."
2. Every sentence must add information beyond the module name
3. No source code in identity documents — code belongs in `resources/`
4. No file listings — summarize the implementation approach
5. Omit a section rather than writing "TODO" or "See code"
6. 3–6 sentences per section unless complexity demands more

---

## Reading Strategy

When reading ArchUI modules, follow the **overview-first** approach:

1. Read `description` fields first (one-sentence scan)
2. Select 2–3 relevant modules
3. Only then read full bodies

Never read all identity documents fully at once. Start narrow, expand as needed.

---

## Quality Checklist

- [ ] Frontmatter has exactly `name` and `description` — nothing else
- [ ] `description` is one declarative sentence in present tense
- [ ] Body has at minimum an `## Overview` section
- [ ] No source code, config snippets, or file listings in the body
- [ ] No "TODO", "TBD", or "See code" placeholders
- [ ] If body exceeds 300 lines, a table of contents is present
- [ ] Third-person present tense throughout
- [ ] HARNESS has `[init]`/`[action]`/`[eval]`/`[end]` structure
- [ ] MEMORY observations are timestamped and append-only
EOF

# ---------------------------------------------------------------------------
# Command: .cursor/skills/archui-spec/commands/convert-project.md
# ---------------------------------------------------------------------------

mkdir -p .cursor/skills/archui-spec/commands

echo "--> Writing .cursor/skills/archui-spec/commands/convert-project.md"
cat > .cursor/skills/archui-spec/commands/convert-project.md << 'EOF'
# Convert Project to ArchUI Structure

You are converting an existing software project into a valid ArchUI-compliant module structure. Work autonomously and completely. Do not pause to ask questions.

## Execution Workflow

1. Read `.archui/conversion-plan.yaml` for candidate modules
2. For each candidate: determine name/description, apply README merge rule, write `.archui/index.yaml` and `.archui/layout.yaml`
3. Register child modules in parent's `.archui/index.yaml` submodules map
4. Infer and write cross-module links
5. Validate: `node cli/resources/dist/index.js validate .`
6. Fix all errors, re-validate until zero ERRORs
7. Delete `.archui/conversion-plan.yaml`

## Hard Constraints

- **Never** modify files inside `resources/` directories
- **Never** change an existing UUID
- **Never** add `uuid`, `submodules`, or `links` to README.md frontmatter
- `description` must be a single sentence
- All UUIDs must be 8 lowercase hex characters
- Use `README.md` for all modules unless explicitly requested otherwise
EOF

echo ""
echo "==> Deployment complete."
