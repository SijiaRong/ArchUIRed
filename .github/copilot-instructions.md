# ArchUI Project Instructions

## What is ArchUI

ArchUI is a filesystem-first knowledge management system. The **filesystem is the source of truth** — all knowledge lives as folders and typed identity documents. There is no database.

Every module is a folder. Every folder contains exactly one identity document (`README.md`, `SPEC.md`, `HARNESS.md`, `MEMORY.md`, or `SKILL.md`) plus `.archui/index.yaml` for structural metadata.

## Always-on constraints

- **Frontmatter purity:** Identity documents may only contain `name` and `description` frontmatter fields. `uuid`, `submodules`, `links`, and `layout` belong in `.archui/index.yaml`, never in frontmatter.
- **Single-sentence description:** The `description` field must be one declarative sentence. It is always loaded into agent context.
- **Validate after every spec change:** Run `node cli/resources/dist/index.js validate .` and fix all ERRORs before proceeding.
- **Resources boundary:** Never read or modify `resources/` unless the user explicitly authorizes it. Always analyze from spec level first.
- **UUID permanence:** Module UUIDs (8 lowercase hex chars) never change after creation — not on rename, not on move.
- **Separate commits:** Spec changes (`README.md`, `.archui/index.yaml`) and resources changes go in separate commits. Spec commit first, then resources.
- **Module context loading:** When reading any module's identity document, you must also read `.archui/index.yaml` in the same directory. Identity documents have only `name` and `description`; the uuid, submodules, and links live in `index.yaml`. A module's context is incomplete without both.

## Key workflows

### Create a new module
1. Create a folder with an identity document (`README.md` or appropriate typed variant)
2. Generate a UUID: `openssl rand -hex 4` (check uniqueness with `grep -r "<uuid>" . --include="*.yaml"`)
3. Create `.archui/index.yaml` with `schema_version: 1`, `uuid`, `submodules`, `links`
4. Register the new folder in the parent's `.archui/index.yaml` submodules map
5. Run validator: `node cli/resources/dist/index.js validate .`

### Edit an existing module
1. Edit `README.md` (only `name`/`description` in frontmatter)
2. Edit `.archui/index.yaml` for structural changes (links, submodules)
3. Run validator

### SPEC modules
A `SPEC.md` module must have exactly one `HARNESS.md` submodule as a **direct** child. A `MEMORY.md` submodule is optional (at most one).

A `HARNESS.md` module must have exactly one link (to its parent SPEC). No other links allowed.

### Commit discipline
```bash
git diff --cached --name-only
# If output has both README.md/.archui files AND resources/ files — split the commit
```
Commit message prefixes: `spec:` for spec changes, `web:`/`ios:`/`android:`/`cli:` for platform resources.

## Validation reference

```bash
node cli/resources/dist/index.js validate .
```

ERROR = blocking, fix before proceeding. WARN = advisory only.
