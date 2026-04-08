---
name: Migration Test Playbook
description: "Playbook for verifying the migration command's dry-run, backup, apply, rollback, and idempotency behaviors across schema version upgrades."
---

## Overview

This playbook verifies the migration module's key behaviors: schema version detection, dry-run preview, backup creation, successful application, idempotency, and rollback on failure.

---

## Playbook

### Group 1: Schema version mismatch detection and dry-run

[init] An ArchUI project has schema_version: 1 in its .archui/index.yaml. The CLI binary expects schema_version: 2. A migration script for v1→v2 exists in the CLI.

[action] Run archui validate on the project.
[eval] The validator exits with a non-zero code and prints a clear version mismatch error (e.g., "project schema_version: 1, CLI expects: 2"). Validation is refused entirely. The error message directs the user to run archui migrate.

[action] Run archui migrate --dry-run on the project.
[eval] The command prints every change that would be made (files modified, fields added or removed, filesystem moves) without writing anything to disk. The project files remain unchanged after the dry-run completes.

[action] Verify the dry-run output matches the runbook entry for the v1→v2 migration documented in the migration module.
[eval] Every change listed in the dry-run output corresponds to a step described in the runbook. No changes appear in the dry-run that are not accounted for in the runbook.

[end] No files have been modified. The project is still at schema_version: 1.

---

### Group 2: Successful migration, backup, and validation

[init] Same project as Group 1: schema_version: 1, CLI expects: 2. Dry-run has been reviewed and approved.

[action] Run archui migrate (without --dry-run).
[eval] The migration creates a timestamped backup directory at .archui/migration-backup/<timestamp>/ containing a copy of every file it will touch before modifying them. The migration script applies all changes for v1→v2.

[action] After migration completes, inspect the exit code and terminal output.
[eval] The command exits with code 0. The output confirms all pending migrations were applied. archui index --fix was automatically run after the migration scripts completed.

[action] Run archui validate on the now-migrated project.
[eval] The validator exits with code 0 and reports no violations. The project is now at schema_version: 2.

[end] The backup directory at .archui/migration-backup/ remains on disk. No automatic cleanup has occurred.

---

### Group 3: Idempotency and rollback

[init] The project from Group 2 has already been successfully migrated to schema_version: 2.

[action] Run archui migrate again on the already-migrated project.
[eval] The command detects the project is already at the current schema version and exits with code 0 without making any changes. Alternatively, the migration script handles the already-applied state gracefully (e.g., skips adding a field that already exists) and produces the same result as the first run.

[action] Simulate a failing migration by introducing a syntax error into a test migration script so it raises an unhandled exception mid-run. Run archui migrate with this broken script on a schema_version: 1 project.
[eval] The migration command rolls back all filesystem changes made by the failing script using the pre-migration backup. The command exits with code 1 and prints the error plus the path to the backup directory. Files modified by any earlier (successful) migration steps are not rolled back.

[action] Restore the project to a clean state using the backup files. Run archui validate.
[eval] The project is back to its pre-migration state (schema_version: 1). archui validate reports the version mismatch error again, confirming the rollback was complete.

[end] Fix the broken migration script. Run archui migrate successfully. Confirm archui validate passes at the new schema version.
