---
name: Migration Runbooks
description: "The runbook template for documenting each schema migration, the registry of completed migration runbooks, and agent instructions for executing a migration safely."
---

## Overview

Every breaking schema change must have a runbook entry here before it ships. The runbook gives humans and agents a plain-language description of the migration, the rationale, and how to verify it succeeded. It is the companion document to the migration script in `migration-scripts/`.

## Runbook Template

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
<How to confirm the migration succeeded. Include specific archui validate invocations, field checks, or filesystem assertions that should pass after migration.>

**Rollback notes:**
<Any caveats about manual rollback, or cases where the automatic rollback may be insufficient.>
```

## Completed Migration Runbooks

*No breaking schema changes have been released yet. This section will be populated as migrations are written.*

## Agent Instructions: Running a Migration

When an ArchUI agent encounters a schema version mismatch, follow these steps:

1. **Read the error.** Confirm the project's `schema_version` and the CLI's expected version.
2. **Run dry-run first.** Execute `archui migrate --dry-run` and review every proposed change. Verify it matches the runbook entry for that version pair above.
3. **Confirm the backup location.** Ensure `.archui/migration-backup/` is writable and has sufficient space.
4. **Apply the migration.** Execute `archui migrate`. Check exit code.
5. **Validate.** Run `archui validate` on the project. It must exit 0 with no errors.
6. **Inspect the diff.** Review what changed in the filesystem. Confirm it matches the runbook.
7. **Commit.** Stage all changed files and commit with message: `chore: migrate to schema v<N>`.
8. **Update this module** if the runbook entry was missing or incomplete.
