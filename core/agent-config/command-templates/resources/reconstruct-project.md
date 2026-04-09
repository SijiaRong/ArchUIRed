# Reconstruct Project as ArchUI Module Tree

You are reconstructing an existing software project into a well-designed ArchUI module tree. The project's original files have been backed up to `.archui-backup/` (read-only reference) and `.archui-temp/` (mutable working copy). Work autonomously and completely. Do not pause to ask questions.

---

## Table of Contents

| Section | Line | Description |
|---------|------|-------------|
| [Overview](#overview) | 23 | What this command does and how it's structured |
| [Hard Constraints](#hard-constraints) | 36 | Non-negotiable rules — read before starting |
| [Phase 2: Parallel Analysis](#phase-2-parallel-analysis) | 51 | Spawn sub-agents to analyze each top-level directory |
| [Phase 3: Module Design](#phase-3-module-design) | 103 | Architect agent designs a new module tree from analysis |
| [Phase 4: Split Validation Loop](#phase-4-split-validation-loop) | 180 | Reviewer agent checks the design; loops until accepted |
| [Phase 5: File Relocation](#phase-5-file-relocation) | 225 | Move files from .archui-temp into module resources |
| [Phase 6: ArchUI Scaffolding](#phase-6-archui-scaffolding) | 281 | Create metadata, identity documents, and cross-module links |
| [Phase 7: Validation Loop](#phase-7-validation-loop) | 447 | Run validator, fix errors and warnings, repeat until clean |
| [Completion Summary](#completion-summary) | 488 | Final report after all phases succeed |

---

## Overview

This workflow redesigns the project's module structure from first principles rather than preserving the original directory layout. It proceeds in six phases:

1. **Parallel Analysis** — spawn sub-agents to analyze each top-level directory in `.archui-backup/`
2. **Module Design** — an architect agent reads all analysis reports and proposes a new module tree
3. **Split Validation Loop** — a reviewer agent checks the design against decomposition principles; loops until accepted
4. **File Relocation** — sub-agents move files from `.archui-temp/` into the correct module's `resources/`
5. **ArchUI Scaffolding** — sub-agents create `.archui/` metadata, identity documents, and cross-module links
6. **Validation Loop** — run `archui validate .`, fix all errors and warnings, repeat until clean

---

## Hard Constraints

These rules are absolute. Violating any of them corrupts the module graph or breaks reversibility.

- **Never** modify, create, or delete `.archui-backup/` or anything inside it — it is the read-only reference copy and must remain intact throughout the entire process
- **Never** copy files back into `.archui-temp/` — only move files out of it
- The set of files across all modules' `resources/` directories must exactly equal the original `.archui-backup/` contents (reversibility contract)
- **Never** change an existing UUID in any `.archui/index.yaml`
- **Never** add `uuid`, `submodules`, or `links` to identity document frontmatter — these belong only in `.archui/index.yaml`
- `description` must be a single sentence with no line breaks
- All UUIDs must be 8 lowercase hex characters (e.g., `a3f2b1c9`) — never RFC 4122 format
- Identity document type must match resource content: `SPEC.md` for source code, `HARNESS.md` for tests, `MEMORY.md` for logs/knowledge, `README.md` only for modules with no resources

---

## Phase 2: Parallel Analysis

### Goal

Build a comprehensive understanding of the original project by analyzing it in parallel.

### Execution

1. List all top-level directories in `.archui-backup/`. Skip: `.git`, `node_modules`, `.archui`, `dist`, `build`, `.next`, `__pycache__`, `vendor`, `.cache`, `coverage`, `out`, `tmp`.
2. Spawn one sub-agent per top-level directory. Each sub-agent:
   a. Reads all files in its assigned directory tree
   b. Produces a structured YAML analysis report
3. Write reports to `.archui-temp/.analysis/<dir-name>.yaml`
4. Also spawn one sub-agent for root-level files (files directly in `.archui-backup/` that are not inside any subdirectory). Write its report to `.archui-temp/.analysis/_root.yaml`.

### Analysis Report Format

Each sub-agent must produce a YAML file with this schema:

```yaml
path: "backend/api/"
purpose: "One sentence describing what this part of the project does"
tech_stack: ["Node.js", "Express", "TypeScript"]
entry_points: ["src/index.ts", "src/server.ts"]
dependencies:
  internal: ["backend/shared/", "backend/db/"]
  external: ["express", "pg", "jsonwebtoken"]
file_count: 47
total_size_kb: 312
key_abstractions:
  - "Route handlers for /users, /auth, /admin"
  - "Middleware chain: auth, validation, error handling"
  - "Database connection pool and query builder"
concepts:
  - name: "Authentication"
    files: ["src/middleware/auth.ts", "src/routes/auth/"]
    description: "JWT-based authentication and session management"
  - name: "User Management"
    files: ["src/routes/users/", "src/models/user.ts"]
    description: "CRUD operations for user accounts"
```

The `concepts` field is critical — it identifies semantically coherent groups of files that may become modules.

### Quality Rules

- Read actual file contents, not just filenames — filenames can be misleading
- Identify cross-directory dependencies (imports, requires, package references)
- Note any existing documentation (README, docs/, comments) to inform naming

---

## Phase 3: Module Design

### Goal

Design a new module tree from scratch based on the analysis reports.

### Execution

1. Read all analysis reports from `.archui-temp/.analysis/`
2. Read the root-level analysis (`_root.yaml`) to understand the overall project
3. Design a module tree following the decomposition principles below

### Module Decomposition Principles

**What becomes a module:**

- A coherent, nameable concept — describable in one sentence
- A group of files that share a lifecycle, are deployed together, or have a clear dependency boundary
- Something a new team member would think of as "a thing"

**What does NOT become a module:**

- Pure implementation detail: `utils/`, `helpers/`, `types/`, `constants/` — unless they represent a distinct library
- Build artifacts or dependency folders
- Individual files (unless they represent a standalone concern)

**Splitting aggressively:**

- If you find yourself writing "and" in a module description, split it
- Prefer more, smaller modules over fewer, larger ones
- Every module should be independently comprehensible
- Depth: aim for 2–4 levels for typical projects

**Reversibility constraint:**

- Every original file must map to exactly one module's `resources/`
- The union of all `resources/` directories must contain every original file — nothing may be lost

### Naming Rules

- **`name`**: Human-readable, 2–4 words, Title Case — e.g. "API Server", "Auth Service"
- **`description`**: One sentence, present tense, describes purpose not implementation — e.g. "Handles HTTP routing, middleware, and request validation." NOT "Contains route.ts and middleware.ts."

### Output Format

Write the module design to `.archui-temp/.module-design.yaml`:

```yaml
modules:
  - path: "api-server/"
    name: "API Server"
    description: "Handles HTTP routing, middleware, and request validation."
    type: SPEC
    sources_from:
      - "backend/api/src/routes/"
      - "backend/api/src/middleware/"
      - "backend/api/package.json"
    children:
      - path: "authentication/"
        name: "Authentication"
        description: "JWT-based authentication and session management."
        type: SPEC
        sources_from:
          - "backend/api/src/middleware/auth.ts"
          - "backend/api/src/routes/auth/"
      - path: "authentication-harness/"
        name: "Authentication Harness"
        description: "Validates authentication flows and token lifecycle."
        type: HARNESS
        sources_from:
          - "backend/api/tests/auth/"
```

`sources_from` lists paths relative to `.archui-backup/`. Every file in `.archui-backup/` (excluding skip dirs) must appear in exactly one module's `sources_from`.

---

## Phase 4: Split Validation Loop

### Goal

Verify the module design meets quality standards; iterate until it does.

### Execution

1. Read `.archui-temp/.module-design.yaml`
2. Check each criterion below
3. If any criterion fails:
   - Write a review file `.archui-temp/.design-review.yaml` listing each failure with the module path and the specific issue
   - The Phase 3 agent (or a new architect agent) reads the review and revises `.archui-temp/.module-design.yaml`
   - Re-run this validation
   - Repeat until all criteria pass
4. When all criteria pass, write `.archui-temp/.design-approved` (empty file) as the gate signal

### Acceptance Criteria

| # | Criterion | Check |
|---|-----------|-------|
| 1 | Single responsibility | No module description contains "and" connecting two distinct concerns |
| 2 | Completeness | Every file in `.archui-backup/` (excluding skip dirs) appears in exactly one `sources_from` |
| 3 | No orphans | No `sources_from` entry points to a file that doesn't exist in `.archui-backup/` |
| 4 | Depth reasonable | No module is deeper than 4 levels |
| 5 | Names meaningful | Every `name` is 2–4 words, Title Case; every `description` is one sentence |
| 6 | Granularity check | No module's `sources_from` contains more than 50 files — suggest splitting if so |
| 7 | Reversibility | The union of all `sources_from` paths equals the full set of files in `.archui-backup/` |

### Review File Format

```yaml
failures:
  - module: "api-server/"
    criterion: 1
    issue: "Description contains 'and' joining two concerns: routing and database access"
    suggestion: "Split into 'API Router' and 'Database Layer'"
  - module: null
    criterion: 2
    issue: "File 'backend/shared/types.ts' not assigned to any module"
    suggestion: "Add to 'Shared Types' module or assign to nearest consumer"
```

---

## Phase 5: File Relocation

### Goal

Move every file from `.archui-temp/` into the correct module's `resources/` directory.

### Execution

1. Read `.archui-temp/.module-design.yaml` (must have `.design-approved` gate)
2. Create the module directory tree in `{{project.root}}` (only directories — no files yet):
   ```
   {{project.root}}/
   ├── api-server/
   │   ├── resources/
   │   └── authentication/
   │       └── resources/
   └── frontend/
       └── resources/
   ```
3. Spawn one sub-agent per top-level module. Each sub-agent:
   a. Reads its module's `sources_from` list
   b. For each source path, moves the file from `.archui-temp/<source-path>` to `<module-path>/resources/<relative-path>`
   c. Preserves directory structure within resources
   d. Uses `git mv` if inside a git repo, otherwise plain `mv`

4. After all sub-agents complete, verify `.archui-temp/` contains only:
   - `.analysis/` directory (can be deleted)
   - `.module-design.yaml` (can be deleted)
   - `.design-review.yaml` (can be deleted)
   - `.design-approved` (can be deleted)
   - No other files or directories

5. If any file remains in `.archui-temp/` that is not in the above list, it was missed by the module design. Create a new module for it or add it to the nearest appropriate module's resources.

6. Once `.archui-temp/` is confirmed empty of project files, delete the entire `.archui-temp/` directory.

### Root-level Files

Files that were directly in `.archui-backup/` (not in any subdirectory) go into the root module's `resources/`:
- `{{project.root}}/resources/package.json`
- `{{project.root}}/resources/.gitignore`
- etc.

### Source Path Resolution

When a `sources_from` entry is a directory (ends with `/`), move the entire directory tree. When it is a file, move just that file. Preserve the relative path structure beneath the `sources_from` prefix:

| `sources_from` entry | File in `.archui-temp/` | Destination |
|---|---|---|
| `backend/api/src/routes/` | `backend/api/src/routes/users.ts` | `api-server/resources/src/routes/users.ts` |
| `backend/api/package.json` | `backend/api/package.json` | `api-server/resources/package.json` |

Strip the `sources_from` prefix up to the module boundary. The goal: `resources/` contains files as though the module were a standalone project.

---

## Phase 6: ArchUI Scaffolding

### Goal

Create all ArchUI metadata and identity documents for every module in the tree.

### Execution

Spawn one sub-agent per top-level module. Each sub-agent handles all modules within its subtree.

### 6.1 — Generate UUIDs

For each module in the subtree:

```bash
openssl rand -hex 4
```

Verify uniqueness: `grep -r "<uuid>" . --include="*.yaml"` — regenerate if found.

### 6.2 — Write `.archui/index.yaml`

```yaml
schema_version: 1
uuid: "<uuid>"
submodules:
  <child-folder-name>: <child-uuid>
links: []
```

### 6.3 — Write `.archui/layout.yaml`

Leaf modules (no children):

```yaml
nodes: {}
viewport:
  zoom: 1
  pan: {x: 0, y: 0}
```

Parent modules (has children):

```yaml
layout:
  <child-uuid>:
    x: "0"
    y: "0"
```

### 6.4 — Write Identity Documents

Based on the module's `type` from the design:

**For SPEC modules** (have source code in resources):

- Write `SPEC.md` with `name` and `description` frontmatter
- Create `<module-name>-harness/` submodule with:
  - `HARNESS.md` (frontmatter: `name`, `description`)
  - `.archui/index.yaml` (new UUID, empty submodules, one link to parent SPEC with `relation: implements`)
  - `.archui/layout.yaml` (leaf form)
- Register harness in parent's `submodules` map
- Optionally create `<module-name>-memory/` submodule (same pattern with `MEMORY.md`, link to parent SPEC)

**For HARNESS modules** (have test code in resources):

- Write `HARNESS.md` with `name` and `description` frontmatter
- Must have exactly one link to parent SPEC (`relation: implements`)
- No child modules permitted

**For MEMORY modules** (have logs/knowledge in resources):

- Write `MEMORY.md` with `name` and `description` frontmatter
- Should link only to parent SPEC

**For README modules** (no resources, organizational containers):

- Write `README.md` with `name` and `description` frontmatter

### 6.5 — Enrich Documentation Bodies

For each identity document, write the body below the frontmatter `---` closing.

**`SPEC.md` / `README.md`:**

```markdown
## Overview
[What, why, what problem — 2-4 sentences based on actual resource content]

## Design
[Key design decisions, architecture approach — 3-6 sentences]

## Sub-modules
[One sentence per child module]

## Dependencies
[One sentence per link explaining the relationship]
```

**`HARNESS.md`:**

```markdown
## Overview
[What this harness tests — 2-3 sentences]

## Test Approach
[Testing strategy, scenarios, acceptance criteria]
```

**`MEMORY.md`:**

```markdown
## Overview
[What knowledge this module records — 2-3 sentences]
```

Content rules:

- Third-person present tense: "This module validates…"
- Every sentence must add information beyond the module name
- Do not reproduce source code — describe the design
- Read representative files in `resources/` for accurate facts
- Omit a section rather than writing "TODO" or "See code"
- 3–6 sentences per section
- **Never modify frontmatter.** Only the markdown body below the closing `---` is in scope.

### 6.6 — Infer Cross-Module Links

Scan `resources/` for import statements, package dependencies, and cross-references:

| Signal | Relation |
|--------|----------|
| Module A imports from module B | `depends-on` |
| Module A is the test suite for module B | `implements` |
| Module A extends module B's API | `extends` |
| Module A references module B in docs | `references` |
| Loose coupling without clear direction | `related-to` |

Add to source module's `.archui/index.yaml`:

```yaml
links:
  - uuid: <target-uuid>
    relation: depends-on
    description: <one-sentence reason>
```

Only add confident links. Do not fabricate.

### 6.7 — Register All Modules in Root

Update `{{project.root}}/.archui/index.yaml` submodules map with all top-level modules.

Update `{{project.root}}/.archui/layout.yaml` to parent form:

```yaml
layout:
  <child-uuid>:
    x: "0"
    y: "0"
```

**Coordination:** Sub-agents work in parallel across top-level modules. No two sub-agents touch the same `index.yaml`.

---

## Phase 7: Validation Loop

### Goal

Ensure the entire project passes `archui validate .` with zero errors and zero warnings.

### Execution

1. Run:

```bash
archui validate .
```

2. Read all output lines. For each ERROR or WARN:

| Error | Fix |
|---|---|
| `links/dangling-uuid` | Remove the link or add the missing target module |
| `archui/undeclared-subfolder` | Add the folder to its parent's `submodules` map |
| `frontmatter/missing-field` | Add missing `name` or `description` |
| `archui/missing-file` | Create `.archui/index.yaml` in the folder |
| `spec/missing-harness` | Create `<name>-harness/` with `HARNESS.md` and link to parent SPEC |
| `layout/missing-file` | Create `.archui/layout.yaml` |

3. Spawn sub-agents to fix errors in parallel (one per top-level module subtree).

4. Re-run `archui validate .` after fixes.

5. **Repeat until the validator exits with zero errors AND zero warnings.** Do not stop early.

6. Final verification — confirm every file in `.archui-backup/` exists in exactly one module's `resources/`:

```bash
diff -rq .archui-backup/ <collect-all-resources-dirs>
```

Walk `.archui-backup/` (excluding skip dirs) and for each file, verify it exists at exactly one path under some module's `resources/`. Report any missing or duplicated files.

---

## Completion Summary

After all phases complete successfully, print a summary:

```
=== ArchUI Reconstruction Complete ===

Modules created:  <count>
Files relocated:  <count>
Validation:       PASS — 0 errors, 0 warnings

Module tree:
  <project-name>/
  ├── api-server/            (SPEC)
  │   ├── authentication/    (SPEC)
  │   └── database/          (SPEC)
  ├── frontend/              (SPEC)
  │   ├── components/        (SPEC)
  │   └── pages/             (SPEC)
  └── shared/                (README)

Backup location: .archui-backup/
```

The `.archui-backup/` directory is retained for manual verification. Delete it when satisfied:

```bash
rm -rf .archui-backup/
```
