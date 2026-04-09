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
