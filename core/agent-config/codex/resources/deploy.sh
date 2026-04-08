#!/usr/bin/env bash
set -euo pipefail

# deploy.sh — Codex adapter deployment script
# Run from the repo root: bash core/agent-config/codex/resources/deploy.sh

echo "[codex/deploy] Writing AGENTS.md to project root..."

cat > AGENTS.md << 'EOF'
# ArchUI Agent Instructions

## Project Overview

ArchUI is a filesystem-first knowledge management system. The **filesystem is the source of truth** — all knowledge lives as folders and typed identity documents. There is no database.

**Key concepts:**
- Every module is a folder
- Every folder contains exactly one typed identity document: `SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`, or `README.md` (generic fallback)
- Every folder contains `.archui/index.yaml` for structural metadata (uuid, submodules, links)
- Cross-module links use UUIDs, not file paths

The system has two interfaces: a **CLI** (validator) and a **GUI** (node-based visual canvas). Development is docs-driven and agent-executed.

---

## Rules

### Frontmatter Purity

Identity documents may only contain two frontmatter fields: `name` and `description`.

```yaml
---
name: Human-readable module name
description: One-sentence summary of this module's purpose
---
```

**Forbidden in frontmatter:** `uuid`, `submodules`, `links`, `layout`, and any other structural field. These belong in `.archui/index.yaml`.

**Why:** Mixing structural data into identity documents breaks the CLI validator and confuses agent context loading.

**Common violations:**
- Adding `uuid:` to a README.md frontmatter block
- Copying `links:` arrays into identity documents
- Writing multi-sentence descriptions

---

### Validation Mandate

Run the CLI validator after every spec change. No exceptions.

```bash
node cli/resources/dist/index.js validate .
```

Fix all `ERROR` outputs before proceeding. `WARN` outputs are advisory.

**Why:** The validator is the conformance gate. Unvalidated changes may silently break module structure, UUID references, or SPEC submodule requirements.

**Common errors:**

| Error | Meaning | Fix |
|---|---|---|
| `links/dangling-uuid` | Link targets a UUID not in the project | Remove link or add missing module |
| `archui/undeclared-subfolder` | Subfolder not in parent's submodules map | Add to parent `.archui/index.yaml` |
| `frontmatter/missing-field` | Missing `name` or `description` | Add the missing field |
| `archui/missing-file` | `.archui/index.yaml` not found | Create with `schema_version: 1` and `uuid` |
| `spec/missing-harness` | SPEC has no HARNESS submodule | Add `<name>-harness/` with `HARNESS.md` |

---

### Resources Boundary

Never read or modify any `resources/` folder content unless the user explicitly authorizes it.

**Why:** Resources contain platform implementation code. Spec (README.md, .archui/) and resources are separate concerns with separate commit disciplines. Touching resources without authorization can break implementations that are being developed independently.

**Allowed without asking:** Reading README.md and `.archui/index.yaml`, running the validator, running `git diff`/`git log`.

**Requires explicit authorization:** Reading or modifying files inside `resources/`, running build commands.

When the user reports a bug: read spec modules first, run validation, then ask about resources only if spec is complete and valid.

---

### UUID Permanence

Module UUIDs never change after creation — not on rename, not on move, not on content edit.

**Format:** 8 lowercase hex characters (e.g., `93ab33c4`). Never RFC 4122 format.

**Why:** All cross-module links use UUIDs. If a UUID changes, every link pointing to that module breaks silently.

**Generating:**
```bash
openssl rand -hex 4
# Check uniqueness:
grep -r "<generated-uuid>" . --include="*.yaml"
```

Always quote UUIDs in YAML that look like numbers or scientific notation (e.g., `"785e2416"`).

---

### Commit Discipline

Spec changes and resources changes must be in separate commits.

| Commit type | Files | Message prefix |
|---|---|---|
| Spec | `README.md`, `.archui/index.yaml` only | `spec:` |
| Web resources | `web-development-release/**/resources/**` | `web:` |
| iOS resources | `ios-development-release/**/resources/**` | `ios:` |
| Android resources | `android-development-release/**/resources/**` | `android:` |
| CLI resources | `cli/resources/**` | `cli:` |

**Why:** Mixed commits make it impossible to bisect spec vs. implementation regressions. Spec defines the contract; resources implement it — they must be versioned separately.

Check before committing:
```bash
git diff --cached --name-only
# If output contains both README.md/.archui files AND resources/ files — split into two commits
```

Spec commit first, then resources commit.

---

### Module Context Loading

When reading any module's identity document (`README.md`, `SPEC.md`, `SKILL.md`, `HARNESS.md`, `MEMORY.md`), you **must also read** `.archui/index.yaml` in the same directory. A module's context is not complete until both files have been read.

**Why:** Identity documents contain only `name` and `description`. The structural half — `uuid`, `submodules` (child modules), and `links` (cross-module dependencies) — lives exclusively in `.archui/index.yaml`. Without it you cannot know what the module depends on or contains.

**Common violations:**
- Reading `SPEC.md` and starting to edit without checking what the module links to
- Answering "what does this module depend on?" from the identity document body alone
- Creating a new link without first reading `index.yaml` to check existing links

---

## Workflows

### Create a new module

1. Create a folder with the appropriate identity document (`README.md` for generic; `SPEC.md` for specs)
2. Add frontmatter with only `name` and `description`
3. Generate a UUID: `openssl rand -hex 4` — verify uniqueness with grep
4. Create `.archui/index.yaml`:
   ```yaml
   schema_version: 1
   uuid: <generated-uuid>
   submodules: {}
   links: []
   ```
5. Register the new folder in the **parent** module's `.archui/index.yaml` submodules map
6. Run validator: `node cli/resources/dist/index.js validate .`
7. Fix all errors

For SPEC modules: also create `<name>-harness/` (with `HARNESS.md`) as a direct submodule. Optionally create `<name>-memory/` (with `MEMORY.md`) if persistent memory tracking is needed.

### Edit an existing module

1. Edit the identity document (body prose only — no structural fields in frontmatter)
2. Edit `.archui/index.yaml` for structural changes (add/remove links or submodules)
3. Run validator

### Declare a cross-module link

1. Find the target module's UUID in its `.archui/index.yaml`
2. Add to the source module's `.archui/index.yaml`:
   ```yaml
   links:
     - uuid: <target-uuid>
       relation: depends-on   # depends-on | implements | extends | references | related-to
       description: Optional clarification
   ```
3. Run validator

### Sync spec after resources changes

After `resources/` code changes pass testing:
1. Find the smallest affected spec modules (innermost first)
2. Update README.md body and `.archui/index.yaml` links/submodules from the bottom up
3. Work upward until all ancestors are accurate
4. Run validator
5. Commit with `spec:` prefix

---

## Available Commands

Commands are executable agent workflows. When the user asks you to run a command (e.g. "run convert-project"), read these instructions and execute them autonomously.

### convert-project

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

### Step 8: Clean Up

Delete `.archui/conversion-plan.yaml` — it is a temporary file and should not be committed.

---

## Hard Constraints

- **Never** modify files inside `resources/` directories
- **Never** change an existing UUID in any `.archui/index.yaml`
- **Never** add `uuid`, `submodules`, or `links` to README.md frontmatter — these belong only in `.archui/index.yaml`
- `description` must be a single sentence with no line breaks
- All UUIDs must be 8 lowercase hex characters (e.g., `a3f2b1c9`) — never RFC 4122 format
- Use `README.md` for all modules you create — never create `SPEC.md`, `HARNESS.md`, or `MEMORY.md` unless explicitly requested

---

## Validation Reference

```bash
node cli/resources/dist/index.js validate .
```

If the built CLI is unavailable:
```bash
cd cli/resources && npm run build
node cli/resources/dist/index.js validate .
```

`ERROR` = blocking, must fix before proceeding.
`WARN` = advisory, note but may continue.
EOF

echo "[codex/deploy] AGENTS.md written."

echo "[codex/deploy] Running CLI validator..."
if node cli/resources/dist/index.js validate .; then
  echo "[codex/deploy] Validation passed. Deployment complete."
else
  echo "[codex/deploy] Validation FAILED. Review errors above before proceeding." >&2
  exit 1
fi
