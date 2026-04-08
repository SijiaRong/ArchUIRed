---
name: Migration
description: "Defines how ArchUI projects are upgraded when the schema evolves in a backward-incompatible way, including the migration command, script conventions, and runbook template."
---

## Overview

This module is the runbook for ArchUI schema migrations. When the ArchUI spec changes in a backward-incompatible way — new required frontmatter fields, changed UUID format, new mandatory filesystem conventions, or renamed fields — existing projects must be upgraded to continue passing validation.

The migration system is designed around three principles: **safety** (backups before any change), **idempotency** (running a migration twice is always safe), and **transparency** (dry-run mode lets you inspect every change before it is applied).

---

## Schema Versioning

Every ArchUI project contains a `.archui/index.yaml` file at the project root. This file includes a `schema_version` field that records which version of the ArchUI spec the project conforms to:

```yaml
schema_version: 1
modules:
  - uuid: ...
    path: ...
  ...
```

New projects always start at the current schema version. When the ArchUI CLI validates a project, it compares the project's `schema_version` against the version built into the CLI binary. If the project's version is older, the CLI:

1. Prints a clear error identifying the version mismatch (e.g., `project schema_version: 1, CLI expects: 2`).
2. **Refuses to run validation** until the migration is applied.
3. Directs the user to run `archui migrate [path]`.

This hard gate ensures projects are never silently validated against the wrong schema rules.

---

## Migration Command

### `archui migrate [path]`

Inspects the project at `[path]` (defaults to the current directory), reads the current `schema_version` from `.archui/index.yaml`, and runs all pending migration scripts in ascending order until the project is at the current schema version.

**Flags:**

| Flag | Effect |
|------|--------|
| `--dry-run` | Print every change that would be made — files modified, fields added or removed, filesystem moves — without writing anything. |
| `--backup-dir <dir>` | Override the backup location (default: `.archui/migration-backup/`). |
| `--from <version>` | Force migration to start from a specific version, even if `index.yaml` reports a higher version. Use with caution. |

**Exit codes:**

| Code | Meaning |
|------|---------|
| `0` | All pending migrations applied cleanly. Project is now at the current schema version. |
| `1` | One or more migration steps failed. All changes from the failed step are rolled back. Files modified in earlier (successful) steps are NOT rolled back — re-run the command once the root cause is fixed. |

**Typical usage:**

```sh
# Preview what will change
archui migrate --dry-run

# Apply all pending migrations
archui migrate

# Apply migrations to a specific project directory
archui migrate ./projects/my-project
```

After a successful migration, `archui migrate` automatically runs `archui index --fix` to rebuild the project index from the updated filesystem state.

---

## Backward Compatibility Policy

Not every spec change requires a migration. The policy is:

### Non-breaking (additive) changes — no migration required

- Adding a new **optional** frontmatter field (existing modules omit it and continue to pass validation).
- Adding new recommended `relation` type values to the links list (existing relation strings remain valid).
- Relaxing a validation rule (e.g., making a previously required field optional).
- Adding new CLI commands or flags.

Existing projects continue to pass `archui validate` without any changes.

### Breaking changes — bump `schema_version`, migration required

The following always constitute a breaking change:

- Adding a new **required** frontmatter field (existing modules are missing it and fail validation).
- Changing the format of an existing required field (e.g., UUID format from 8-hex to hyphenated UUID4).
- Renaming a required field (e.g., `name` → `title`).
- Removing a previously required field (downstream tooling may depend on its presence; removing it without a migration leaves the field as dead weight in existing files).
- Introducing a new mandatory filesystem convention (e.g., requiring a `resources/` subfolder to be registered, or banning previously allowed folder names).
- Changing the structure of `.archui/index.yaml` itself in a way that breaks existing parsers.

When a breaking change is merged, the ArchUI maintainer must:

1. Increment `CURRENT_SCHEMA_VERSION` in the CLI codebase.
2. Write a migration script (see conventions below).
3. Update this module with a completed runbook entry for the new migration.
4. Coordinate the release via the release-coordination module.

---

## Migration Script Conventions

### Location and naming

Migration scripts live in the ArchUI CLI codebase at:

```
cli/migrations/migration_<from>_to_<to>.py
```

Examples:
- `migration_1_to_2.py` — upgrades a project from schema v1 to v2
- `migration_2_to_3.py` — upgrades a project from schema v2 to v3

The CLI discovers all scripts matching this pattern and sorts them numerically to determine execution order.

### Idempotency requirement

Every migration script MUST be idempotent: running it twice on the same project must produce exactly the same result as running it once. This means:

- Before adding a field, check whether it already exists.
- Before renaming a field, check that the old name is present and the new name is absent.
- Before moving a file, check that the source exists and the destination does not.

The migration command does not track which individual steps have been run within a version gap — it re-runs all scripts from the project's current `schema_version` up to the target. Scripts must handle already-applied state gracefully.

### Backup

Before applying any changes, `archui migrate` creates a backup of every file it will touch:

```
.archui/migration-backup/<timestamp>/
  <relative-path-to-modified-file>
  ...
```

The timestamp format is `YYYYMMDD-HHMMSS` (UTC). If the migration fails or produces unexpected results, files can be restored manually from this directory. Backups are never deleted automatically.

### Post-migration indexing

After all migration scripts complete successfully, the migration command runs:

```sh
archui index --fix
```

This rebuilds `.archui/index.yaml` from the current filesystem state, ensuring the index reflects any files that were added, moved, or renamed during migration.

### Rollback behavior

If a migration script raises an unhandled exception or returns a non-zero exit code, the migration command:

1. Rolls back all filesystem changes made by that script (using the backup created before it ran).
2. Exits with code `1`.
3. Prints the error and the path to the backup directory.

Changes from migration steps that completed successfully before the failing step are NOT rolled back. The project will be in a partially migrated state. Re-run `archui migrate` after fixing the root cause.

---

## Migration Runbook Template

When documenting a new migration, copy this template and fill in each section:

```
### Migration: v<N> → v<N+1>

**Schema change:**
<Describe exactly what changed in the spec — which field, what rule, what format.>

**Rationale:**
<Why was this change necessary? What problem does it solve?>

**Files affected:**
<Which files does the migration script modify? (e.g., all README.md files, .archui/index.yaml, specific paths)>

**What the migration script does:**
<Step-by-step description of what migration_N_to_N+1.py does. Be precise enough that a reader can verify the script matches this description.>

**Verification:**
<How to confirm the migration succeeded. Include specific `archui validate` invocations, field checks, or filesystem assertions that should pass after migration.>

**Rollback notes:**
<Any caveats about manual rollback, or cases where the automatic rollback may be insufficient.>
```

---

## Completed Migration Runbooks

*No breaking schema changes have been released yet. This section will be populated as migrations are written.*

---

## Agent Instructions: Running a Migration

When an ArchUI agent encounters a schema version mismatch, follow these steps:

1. **Read the error.** Confirm the project's `schema_version` and the CLI's expected version.
2. **Run dry-run first.** Execute `archui migrate --dry-run` and review every proposed change. Verify it matches the runbook entry for that version pair above.
3. **Confirm the backup location.** Ensure `.archui/migration-backup/` is writable and has sufficient space.
4. **Apply the migration.** Execute `archui migrate`. Check exit code.
5. **Validate.** Run `archui validate` on the project. It must exit 0 with no errors.
6. **Inspect the diff.** Review what changed in the filesystem. Confirm it matches the runbook.
7. **Commit.** Stage all changed files and commit with message: `chore: migrate to schema v<N>`.
8. **Update this module** if the migration runbook entry was missing or incomplete.
