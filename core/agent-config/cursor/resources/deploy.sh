#!/usr/bin/env bash
set -euo pipefail

# Deploy Cursor adapter — generates .cursor/skills/ and .cursor/rules/ from
# platform-agnostic templates defined in the ArchUI spec.
# Run from repo root: bash core/agent-config/cursor/resources/deploy.sh

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

## Quick Dispatch

| Task | Jump to |
|---|---|
| Creating or enriching a **SPEC.md** | [Writing SPEC.md](#writing-specmd) |
| Creating or enriching a **HARNESS.md** | [Writing HARNESS.md](#writing-harnessmd) |
| Creating or enriching a **MEMORY.md** | [Writing MEMORY.md](#writing-memorymd) |
| Creating or enriching a **README.md** | [Writing README.md](#writing-readmemd) |
| Writing a good `description` field | [Description Field](#description-field) |
| Reading a module you haven't seen before | [Reading Strategy](#reading-strategy) |
| Reading a large module tree | [Tree Scanning](#tree-scanning) |
| Checking documentation quality | [Quality Checklist](#quality-checklist) |

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

| Quality | Example |
|---|---|
| Bad | "This is the CLI module." |
| Bad | "Contains index.ts, validate.ts, and init.ts." |
| Good | "Validates ArchUI filesystem structure and reports conformance errors after agent or human edits." |

---

## Writing SPEC.md

A SPEC defines an implementation specification — a module with `resources/` that implements something. Every SPEC must have exactly one HARNESS submodule.

### Required Sections

```markdown
---
name: Module Name
description: One-sentence purpose statement.
---

## Overview

[What this module does, why it exists, what problem it solves — 2–4 sentences.
Must add information beyond the description field.]

## Design

[Key design decisions, constraints, architectural choices.
Describe the approach without reproducing source code.
Include state machines, data flow, or protocol descriptions if applicable.
3–6 sentences, or structured subsections for complex modules.]

## Sub-modules

[For each direct child in .archui/index.yaml submodules, one sentence
describing its role. Omit this section if no submodules exist.]

## Dependencies

[For each link in .archui/index.yaml links, one sentence explaining
the relationship. Omit this section if no links exist.]
```

### Optional Sections (add when relevant)

- **Commands** — If the module exposes executable agent commands via `.archui/commands/`
- **Constraints** — Hard rules or invariants the implementation must respect
- **API** — Public interfaces, protocol definitions, or contract specifications

### SPEC Anti-Patterns

| Don't | Do |
|---|---|
| Reproduce source code in the body | Describe the design at an architectural level |
| List every file in `resources/` | Summarize the implementation approach |
| Write multi-page prose | Keep each section 3–6 sentences |
| Leave body empty (stub) | Always write at least Overview + Design |
| Write "TODO" or "See code" | Omit a section entirely rather than stub it |

---

## Writing HARNESS.md

A HARNESS is a test playbook for its parent SPEC. It has exactly one link (to the parent SPEC with `relation: implements`). No other links are permitted.

### Required Sections

```markdown
---
name: Module Name Test Playbook
description: "Playbook for verifying that [parent module] correctly [key behavior summary]."
---

## Overview

[What this harness tests and how it verifies the parent SPEC — 2–3 sentences.]

## Playbook

### Group N: [Behavior being tested]

[init] Setup conditions — what must be true before the test.
[action] The action that triggers the behavior under test.
[eval] Observable outcomes that prove the behavior is correct.
[end] Cleanup or reset.
```

### Harness Writing Rules

1. **Group structure**: Each test group targets one coherent behavior. Use `[init]`, `[action]`, `[eval]`, `[end]` markers for each step.
2. **Observable outcomes**: Every `[eval]` must describe something verifiable — a visible state, a measurable value, or a file on disk. Never write "it should work correctly."
3. **Independence**: Each group must be runnable independently. Do not assume prior groups have passed.
4. **Coverage**: Cover the happy path first, then edge cases. Every requirement in the parent SPEC should have at least one corresponding test group.
5. **No implementation details**: Describe *what to verify*, not *how to implement the test code*. The harness is a specification, not a test script.

### Harness Anti-Patterns

| Don't | Do |
|---|---|
| Write vague evals like "works as expected" | Describe specific observable outcomes |
| Couple groups so they must run in order | Make each group independent |
| Test implementation details | Test behavior described in the parent SPEC |
| Skip edge cases | Cover error handling and boundary conditions |

---

## Writing MEMORY.md

A MEMORY records accumulated knowledge and runtime observations for its parent SPEC. Links only to the parent SPEC. Additional outbound links are a warning.

### Required Sections

```markdown
---
name: Module Name Memory
description: "Runtime memory and accumulated observations for the [parent module] module."
---

## Overview

[What accumulated knowledge this memory records — 2–3 sentences.]

## Observations

[Timestamped entries of runtime discoveries, bug patterns, performance notes,
or design trade-off learnings. Append-only — never delete observations.]
```

### Memory Writing Rules

1. **Append-only**: New observations are added at the bottom. Never delete or rewrite existing entries.
2. **Timestamped**: Each observation should include a date or context marker.
3. **Actionable**: Observations should inform future decisions. "The BLE handshake times out after 30s under load" is useful; "tested BLE" is not.
4. **Scoped**: Only record observations relevant to the parent SPEC module. Cross-cutting observations belong in the parent module's memory.

---

## Writing README.md

A README is the generic fallback identity document — used when no stronger type (`SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`) applies. Typically used for organizational grouping modules that have no `resources/`.

### Required Sections

```markdown
---
name: Module Name
description: One-sentence purpose statement.
---

## Overview

[What this module represents, why it exists — 2–4 sentences.]

## Sub-modules

[For each direct child in .archui/index.yaml submodules, one sentence
describing its role. Omit if no submodules.]

## Dependencies

[For each link in .archui/index.yaml links, one sentence explaining
the relationship. Omit if no links.]
```

### When to Promote README to SPEC

If a module with `README.md` gains a `resources/` directory, it should be promoted to `SPEC.md`:

1. Rename: `git mv README.md SPEC.md`
2. Preserve all frontmatter and body content
3. Create a harness submodule: `<name>-harness/` with `HARNESS.md`
4. The harness gets one link to the parent SPEC with `relation: implements`

---

## Progressive Disclosure Rules

These rules prevent documents from becoming unwieldy.

### Table of Contents Trigger

If any identity document body exceeds **300 lines**, prepend a table of contents immediately after the frontmatter:

```markdown
---
name: ...
description: ...
---

## Table of Contents

| Section | Lines | Description |
|---------|-------|-------------|
| [Overview](#overview) | 5–20 | Purpose and scope |
| [Design](#design) | 21–150 | Architecture and decisions |
| ...
```

### Cross-Referencing

When one document needs information from another:

- **Do**: Write a 1–2 sentence summary + link to the authoritative source
- **Don't**: Copy content between documents

```markdown
## BLE Protocol

This module implements the simplified handshake described in the
[BLE Protocol SPEC](../ble-protocol/SPEC.md#handshake). Key differences
from the base protocol: [summarize what's unique here].
```

### Section Depth

- Limit heading depth to H3 (`###`) inside identity documents
- Use tables and lists instead of deeper nesting
- If a section needs H4 or deeper, it is a candidate for splitting into a submodule

---

## Content Quality Rules

These apply to **all** document types.

1. **Third-person present tense**: "This module validates..." not "I will validate..." or "We validate..."
2. **Every sentence adds information**: If a sentence only restates the module name, delete it
3. **No source code in identity documents**: Code belongs in `resources/`. Describe the *design*, not the *contents*
4. **No file listings**: Do not enumerate files in `resources/`. Summarize the implementation approach
5. **Omit rather than stub**: An absent section is better than "TODO" or "See code"
6. **Concise by default**: 3–6 sentences per section unless complexity demands more
7. **Consistent terminology**: Use terms from the parent module or core spec. Do not invent synonyms

---

## Reading Strategy

When reading ArchUI modules, follow the **overview-first** approach to minimize context pollution.

### Reading a Single Module

1. Read the identity document (`SPEC.md` / `README.md` / etc.)
2. Read `.archui/index.yaml` in the same directory — **always**, no exceptions
3. You now have: name, description, uuid, submodules list, links list, and body prose

### Reading a Module Tree (multiple modules)

Use progressive reading to avoid loading unnecessary context:

**Step 1 — Scan descriptions only**

Read the `description` field from each module's identity document frontmatter. This gives you a one-sentence summary of every module without loading any body content.

```
For each module in the tree:
  -> Read first 5 lines of identity doc (captures frontmatter)
  -> Read .archui/index.yaml (captures structure)
```

**Step 2 — Select relevant modules**

From the descriptions, identify the 2-3 modules most relevant to your task.

**Step 3 — Read selected modules fully**

Only now read the full body of the modules you selected.

### Tree Scanning

When exploring a large module tree for the first time:

| What you need | What to read | Context cost |
|---|---|---|
| Module inventory | `description` fields only | ~1 line per module |
| Structure map | `description` + `.archui/index.yaml` | ~5 lines per module |
| Specific module detail | Full identity document + index.yaml | ~50-300 lines |
| Cross-module relationships | `links` from all index.yaml files | ~3 lines per link |

**Never read all identity documents fully at once.** Start narrow, expand as needed.

### Navigating Links

When you encounter a link in `.archui/index.yaml`:

1. Note the target UUID and relation type
2. Find the target module: search for that UUID in other `.archui/index.yaml` files
3. Read the target's description first — decide if you need the full document
4. Only read the full target document if it's directly relevant to your task

---

## Quality Checklist

Before considering a document complete, verify:

- [ ] Frontmatter has exactly `name` and `description` — nothing else
- [ ] `description` is one declarative sentence in present tense
- [ ] Body has at minimum an `## Overview` section
- [ ] No source code, config snippets, or file listings in the body
- [ ] No "TODO", "TBD", or "See code" placeholders
- [ ] Cross-references use relative paths with section anchors
- [ ] If body exceeds 300 lines, a table of contents is present
- [ ] Every section adds information not implied by the module name
- [ ] Third-person present tense throughout
- [ ] HARNESS has `[init]`/`[action]`/`[eval]`/`[end]` structure in playbook groups
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

---

## Module Decomposition Principles

Before creating any files, read the project structure and understand what each directory does. Then apply these principles to decide what becomes a module:

### What to make a module

- A directory that represents a **coherent, nameable concept** — something you could describe in one sentence
- A directory that other parts of the project depend on, or that has its own lifecycle
- A directory that a new team member would think of as "a thing" (e.g., "the CLI", "the API layer", "the auth module")

### What NOT to make a module

- Pure implementation detail folders that are not meaningful on their own: `utils/`, `helpers/`, `types/`, `constants/` — unless they represent a distinct library boundary
- Build artifacts: `dist/`, `build/`, `out/`, `.next/`, `coverage/`
- Dependency folders: `node_modules/`, `vendor/`
- Hidden infrastructure: `.git/`, `.cache/`, `__pycache__/`
- The `resources/` folder inside any ArchUI module (reserved by ArchUI)

### Naming rules

- `name`: Human-readable, 2–4 words, Title Case — e.g. "CLI Init Command", "Auth Service", "User Profile API"
- `description`: One sentence, present tense, describes **purpose** not implementation — e.g. "Handles user authentication and session management." NOT "Contains auth.ts and session.ts."

### Depth guidance

- **Depth 1 first**: Start by making every meaningful top-level directory a module. These are your primary boundaries.
- **Go deeper selectively**: Only create child modules inside a top-level module if that module is large enough that its subdirectories are themselves independently meaningful. Rule of thumb: if you'd describe a subdirectory to a new team member as "the X part of Y", it deserves its own module.
- **Avoid over-splitting**: A module with only one or two source files rarely needs child modules.

### Link inference rules

After creating all modules, look for relationships:
- If module A imports from module B → `A depends-on B`
- If module A is the test suite for module B → `A implements B`  
- If module A is built on top of module B's API → `A extends B`
- If module A just references module B for documentation → `A references B`
- Loose coupling without clear direction → `related-to`

Only add links you are confident about. Do not fabricate links.

---

## Execution Workflow

### Step 1: Read the Conversion Plan

Read `.archui/conversion-plan.yaml` from the project root. This file was generated by the CLI pre-scan and lists candidate folders with inferred names, descriptions, and README states. Use it as a starting point, but read actual folder contents to improve quality.

### Step 2: For Each Candidate Module

#### 2a. Determine Final Name and Description

- Read the actual folder (README.md, package.json, key source files) to understand what it does
- Apply the naming rules above
- Improve the pre-scan's `inferred_name` and `inferred_description` based on real content

#### 2b. Apply the README Merge Rule

Based on `readme_state` in the conversion plan:

| `readme_state` | Action |
|---|---|
| `"missing"` | Create `README.md` with frontmatter only (`name` + `description`) |
| `"no-frontmatter"` | Prepend the frontmatter block; preserve existing body verbatim |
| `"partial"` | Patch only the missing field(s); preserve everything else |
| `"complete"` | Leave the file completely untouched |

**Prepend format** (for `no-frontmatter`):
```
---
name: <name>
description: <description>
---

<original README body, unchanged>
```

The description when prepending must be derived from the actual content — read the file to write a quality sentence.

#### 2c. Write `.archui/index.yaml`

```yaml
schema_version: 1
uuid: "<generate a new 8-hex UUID>"
submodules: {}
links: []
```

Generate: `openssl rand -hex 4`
Verify uniqueness: `grep -r "<uuid>" . --include="*.yaml"` — if found, regenerate.

#### 2d. Write `.archui/layout.yaml`

```yaml
nodes: {}
viewport:
  zoom: 1
  pan: {x: 0, y: 0}
```

### Step 3: Register Child Modules in Parent

For each module created, add it to the parent's `.archui/index.yaml` submodules map:

```yaml
submodules:
  <folder-name>: <child-uuid>
```

Update the parent's `.archui/layout.yaml` to the parent form:
```yaml
layout:
  <parent-uuid>:
    x: "0"
    y: "0"
```
(The GUI will update positions when first opened.)

### Step 4: Infer and Write Cross-Module Links

After all modules are created, scan for dependencies (see link inference rules above). For each confident link, add to the source module's `.archui/index.yaml`:

```yaml
links:
  - uuid: <target-uuid>
    relation: depends-on
    description: <one-sentence explanation>
```

### Step 5: Validate and Fix

```bash
node cli/resources/dist/index.js validate .
```

If the CLI is not available:
```bash
npx archui validate .
```

Read all ERROR lines. Fix each one:

| Error | Fix |
|---|---|
| `links/dangling-uuid` | Remove the link or add the missing target module |
| `archui/undeclared-subfolder` | Add the folder to its parent's `submodules` map |
| `frontmatter/missing-field` | Add missing `name` or `description` to the identity document |
| `archui/missing-file` | Create `.archui/index.yaml` in the folder |

Re-run after each fix round. Continue until zero ERRORs.

### Step 6: Multi-Agent Submodule Completion

Spawn one sub-agent per top-level module directory. Each sub-agent is responsible for auditing and completing the `submodules` maps within its assigned subtree.

**Sub-agent task per top-level module `<module-path>/`:**

1. Walk the entire directory tree under `<module-path>/`, collecting every subfolder that has a `.archui/index.yaml`.
2. For each such subfolder, read its parent's `.archui/index.yaml` and check whether the subfolder's `folder-name → uuid` entry is present in the parent's `submodules` map.
3. For any missing entry, add it:
   ```yaml
   submodules:
     <folder-name>: <child-uuid>   # uuid read from child's .archui/index.yaml
   ```
4. After all missing entries are added, re-run `node cli/resources/dist/index.js validate .` scoped to that module subtree and fix any `archui/undeclared-subfolder` or `archui/submodule-not-found` errors that remain.

**Coordination rule:** Sub-agents work in parallel across top-level modules. No two sub-agents touch the same `index.yaml` file. After all sub-agents complete, the orchestrating agent runs `node cli/resources/dist/index.js validate .` over the full project and fixes any residual errors before proceeding.

### Step 7: Multi-Agent Link Completion

Spawn one sub-agent per top-level module directory. Each sub-agent is responsible for inferring and completing the `links` arrays within its assigned subtree.

**Sub-agent task per top-level module `<module-path>/`:**

1. Walk every module under `<module-path>/` and read its identity document and `.archui/index.yaml`.
2. For each module, scan its `resources/` directory (if present) for import statements, package dependencies, and references to other modules:
   - Source imports (e.g. `import ... from '../../other-module'`)
   - Package.json `dependencies` / `devDependencies` that correspond to sibling modules
   - Explicit cross-module references in prose (identity documents)
3. For each detected relationship, locate the target module's UUID from its `.archui/index.yaml`.
4. If a link to that UUID is not already present in the source module's `links` array, add it using the appropriate relation from the vocabulary:
   ```yaml
   links:
     - uuid: <target-uuid>
       relation: depends-on   # or implements | extends | references | related-to
       description: <one-sentence reason>
   ```
5. Apply the link inference rules: only add links you are confident about. Do not fabricate links for vague or indirect relationships.
6. After completing link additions, run `node cli/resources/dist/index.js validate .` scoped to the subtree and fix any `links/dangling-uuid` errors.

**Coordination rule:** Sub-agents work in parallel. Links are directional — each sub-agent only adds outbound links from modules in its own subtree. After all sub-agents complete, the orchestrating agent runs `node cli/resources/dist/index.js validate .` over the full project and fixes any residual errors before proceeding.

### Step 8: Multi-Agent Documentation Enrichment

Spawn one sub-agent per top-level module directory. Each sub-agent is responsible for enriching the body of every identity document within its assigned subtree so that the documentation is genuinely useful — not just a name and a one-sentence description stub.

**Sub-agent task per top-level module `<module-path>/`:**

1. Walk every module under `<module-path>/` and read its identity document and `.archui/index.yaml`.

2. For each module, classify its current documentation state:
   - **Stub** — body is empty or shorter than three sentences → must enrich
   - **Partial** — body exists but lacks key sections (Overview, architecture, sub-module summary) → fill gaps
   - **Complete** — body covers purpose, design decisions, and sub-module structure adequately → leave unchanged

3. For stub and partial modules, write or expand the identity document body using the following structure:

   **For `README.md` and `SPEC.md` (generic and spec modules):**
   ```markdown
   ## Overview

   [What this module does, why it exists, what problem it solves — 2–4 sentences.]

   ## Design

   [Key design decisions, constraints, or architectural choices. If the module has resources/, summarise the implementation approach without reproducing code. If the module is purely conceptual, describe the model.]

   ## Sub-modules

   [For each direct child module listed in .archui/index.yaml submodules, one sentence describing its role.]

   ## Dependencies

   [For each link in .archui/index.yaml links, one sentence explaining why this module depends on or relates to the target.]
   ```

   **For `HARNESS.md` (test harness modules):**
   ```markdown
   ## Overview

   [What this harness tests, and how it verifies the parent SPEC — 2–3 sentences.]

   ## Test Approach

   [The testing strategy: what scenarios are covered, what acceptance criteria are checked, how results are verified.]
   ```

   **For `MEMORY.md` (persistent memory modules):**
   ```markdown
   ## Overview

   [What accumulated knowledge or session state this memory module records — 2–3 sentences.]
   ```

4. **Content quality rules:**
   - Write in third-person present tense: "This module validates…" not "I will validate…"
   - Every sentence must add information not already implied by the module name
   - Do not reproduce source code, config files, or file listings — describe the design, not the contents
   - If `resources/` exists for this module, read representative files to extract accurate architectural facts before writing
   - Omit a section entirely rather than writing a placeholder like "TODO" or "See code"
   - Keep each section concise: aim for 3–6 sentences per section, not exhaustive prose

5. **Progressive disclosure rule:** If a module's identity document body exceeds 300 lines after enrichment, prepend a table of contents with line numbers immediately after the frontmatter block.

6. **Frontmatter must not change:** Never modify `name`, `description`, or any other frontmatter field. Only the markdown body below the closing `---` fence is within scope.

**Coordination rule:** Sub-agents work in parallel across top-level modules. After all sub-agents complete, the orchestrating agent runs `node cli/resources/dist/index.js validate .` to confirm no frontmatter was corrupted, then proceeds.

### Step 9: Clean Up

Delete `.archui/conversion-plan.yaml` — it is a temporary file and should not be committed.

---

## Hard Constraints

- **Never** modify files inside `resources/` directories
- **Never** change an existing UUID in any `.archui/index.yaml`
- **Never** add `uuid`, `submodules`, or `links` to README.md frontmatter — these belong only in `.archui/index.yaml`
- `description` must be a single sentence with no line breaks
- All UUIDs must be 8 lowercase hex characters (e.g., `a3f2b1c9`) — never RFC 4122 format
- Use `README.md` for all modules you create — never create `SPEC.md`, `HARNESS.md`, or `MEMORY.md` unless explicitly requested
EOF

# ---------------------------------------------------------------------------
# Validate
# ---------------------------------------------------------------------------

echo ""
echo "==> Running CLI validator..."
if node cli/resources/dist/index.js validate .; then
  echo ""
  echo "==> Deployment complete. All files written and validation passed."
else
  echo ""
  echo "==> Deployment complete, but validation reported errors. Review output above."
  exit 1
fi
