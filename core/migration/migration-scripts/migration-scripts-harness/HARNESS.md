---
name: Migration Scripts Test Playbook
description: "Playbook for verifying migration script conventions — idempotency, backup creation, rollback on failure, and post-migration indexing."
---

## Playbook

### Group 1: Idempotency and backup

[init] An ArchUI project at schema_version: 1 exists and passes validation. A migration script for v1→v2 exists and has not yet been applied.

[action] Run archui migrate on the project.
[eval] The migration creates a timestamped backup at .archui/migration-backup/<timestamp>/ containing copies of all files it modifies. The migration script applies its changes and exits with code 0.

[action] Run archui migrate again on the already-migrated project.
[eval] The command exits with code 0 without error. The project state is identical to after the first run — no duplicate fields, no doubled-up changes. The idempotency requirement is satisfied.

[action] Run archui validate after both migration runs.
[eval] The validator exits with code 0. schema_version in index.yaml reflects the new version.

[end] Backup directory at .archui/migration-backup/ remains intact. No cleanup is performed automatically.

---

### Group 2: Rollback on script failure

[init] An ArchUI project at schema_version: 1. A broken migration script for v1→v2 exists that raises an exception midway through modifying files.

[action] Run archui migrate with the broken script.
[eval] The migration creates the backup, begins applying changes, then encounters the exception. All filesystem changes made by the failing script are rolled back using the backup. archui migrate exits with code 1 and prints the error plus the backup directory path.

[action] Inspect the project files after the failed migration.
[eval] All files are identical to their pre-migration state. No partial writes remain.

[action] Fix the broken script and re-run archui migrate.
[eval] The migration completes successfully. archui index --fix runs automatically afterward. archui validate exits with code 0.

[end] Project is now at the new schema version. Backup directory remains on disk.
