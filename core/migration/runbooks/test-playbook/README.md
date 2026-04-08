---
name: Migration Runbooks Test Playbook
description: "Playbook for verifying that runbook entries are complete, match their migration scripts, and that agents follow the runbook-guided migration procedure correctly."
---

## Playbook

### Group 1: Runbook completeness and alignment

[init] A new breaking schema change has been planned. The migration script for v1→v2 has been written in migration-scripts/ but no runbook entry exists yet.

[action] Attempt to ship the migration without adding a runbook entry.
[eval] The process is blocked — the rule requires a runbook entry to exist before a migration is shipped. A review step or CI check flags the missing entry.

[action] Add a runbook entry for v1→v2 following the template, filling in all six sections: schema change, rationale, files affected, what the script does, verification steps, and rollback notes.
[eval] The runbook entry is accepted as complete. All six sections are present and non-empty.

[action] Cross-check the runbook's "what the migration script does" section against the actual migration script behavior.
[eval] Every step described in the runbook corresponds to an actual operation in the migration script. No step is missing from the runbook and no script operation is undocumented.

[end] The runbook entry is committed alongside the migration script in the same commit.

---

### Group 2: Agent migration procedure

[init] An ArchUI agent encounters a schema version mismatch (project: v1, CLI expects: v2). The runbook entry for v1→v2 is present in runbooks/README.md.

[action] The agent runs archui migrate --dry-run and reviews the output against the runbook.
[eval] Every change listed in the dry-run output is accounted for in the runbook's "what the migration script does" section. No unexpected changes appear.

[action] The agent runs archui migrate (without --dry-run).
[eval] The migration completes with exit code 0. The agent then runs archui validate and confirms it exits with code 0.

[action] The agent commits the migrated files with the message "chore: migrate to schema v2".
[eval] The commit includes all changed files and the updated index.yaml. The runbook entry is also updated if it was missing or incomplete.

[end] The project is at schema_version: 2 and passes validation. The agent session ends cleanly.
