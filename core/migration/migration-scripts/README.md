---
name: Migration Scripts
description: "Conventions for writing ArchUI migration scripts — file location, naming, idempotency requirements, backup behavior, post-migration indexing, and rollback on failure."
---

## Overview

Migration scripts are the code artifacts that perform the actual filesystem and frontmatter transformations when upgrading an ArchUI project from one schema version to the next. This module defines all conventions scripts must follow.

## Location and Naming

Migration scripts live in the ArchUI CLI codebase at:

```
cli/migrations/migration_<from>_to_<to>.py
```

Examples:
- `migration_1_to_2.py` — upgrades a project from schema v1 to v2
- `migration_2_to_3.py` — upgrades a project from schema v2 to v3

The CLI discovers all scripts matching this pattern and sorts them numerically to determine execution order.

## Idempotency Requirement

Every migration script MUST be idempotent: running it twice on the same project must produce exactly the same result as running it once. This means:

- Before adding a field, check whether it already exists.
- Before renaming a field, check that the old name is present and the new name is absent.
- Before moving a file, check that the source exists and the destination does not.

The migration command does not track which individual steps have been run within a version gap — it re-runs all scripts from the project's current `schema_version` up to the target. Scripts must handle already-applied state gracefully.

## Backup

Before applying any changes, `archui migrate` creates a backup of every file it will touch:

```
.archui/migration-backup/<timestamp>/
  <relative-path-to-modified-file>
  ...
```

The timestamp format is `YYYYMMDD-HHMMSS` (UTC). If the migration fails or produces unexpected results, files can be restored manually from this directory. Backups are never deleted automatically.

## Post-Migration Indexing

After all migration scripts complete successfully, the migration command runs:

```sh
archui index --fix
```

This rebuilds `.archui/index.yaml` from the current filesystem state, ensuring the index reflects any files that were added, moved, or renamed during migration.

## Rollback Behavior

If a migration script raises an unhandled exception or returns a non-zero exit code, the migration command:

1. Rolls back all filesystem changes made by that script (using the backup created before it ran).
2. Exits with code `1`.
3. Prints the error and the path to the backup directory.

Changes from migration steps that completed successfully before the failing step are NOT rolled back. The project will be in a partially migrated state. Re-run `archui migrate` after fixing the root cause.
