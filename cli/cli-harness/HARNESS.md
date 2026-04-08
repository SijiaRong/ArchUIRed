---
name: CLI Test Playbook
description: Playbook for verifying that the ArchUI CLI correctly validates filesystem conformance and handles the index fix command across normal and error conditions.
---

## Overview

This playbook verifies the top-level CLI behaviors: the `archui validate` command, the `archui index --fix` command, exit code semantics, and output format. Tests are grouped by initial state to minimize setup overhead.

---

## Playbook

### Group 1: Validate on a clean project

[init] A valid ArchUI project root exists. All modules have correct README.md files, all UUIDs are registered in `.archui/index.yaml`, and no structural violations are present.

[action] Run `archui validate` from the project root with no path argument.
[eval] The command exits with code 0. The final output line reads "Validation complete: all checks passed."

[action] Run `archui validate <project-root>` passing the root path explicitly.
[eval] The command exits with code 0 and produces the same passing summary.

[end] No cleanup needed. Project state is unchanged.

---

### Group 2: Validate on a project with violations

[init] A valid ArchUI project root exists and currently passes validation. A module `test-module/` is present with a valid README.md and an entry in `.archui/index.yaml`.

[action] Remove `test-module/README.md` so the folder has no README, then run `archui validate`.
[eval] The command exits with a non-zero code. At least one ERROR line is printed referencing `test-module/` and a specific rule id. The summary line reads "Validation complete: N violation(s) found." where N is at least 1.

[action] Introduce two additional violations: add a loose file `test-module-notes.md` at project root level inside another module, and set a required frontmatter field to empty in a different module's README. Run `archui validate`.
[eval] Each violation appears on its own ERROR line with the file path and rule id. The summary count reflects the total number of violations across all three problems.

[action] Fix all three violations: restore `test-module/README.md`, remove the loose file, and fill in the empty field. Run `archui validate`.
[eval] The command exits 0 and the summary reads "Validation complete: all checks passed."

[end] Remove `test-module/` and its index entry. Confirm `archui validate` passes.

---

### Group 3: Exit code reflects violation count

[init] A valid ArchUI project root exists and passes validation.

[action] Introduce exactly one violation (remove a README.md from a leaf module). Run `archui validate` and capture the exit code.
[eval] Exit code is 1.

[action] Introduce 126 additional violations (e.g., remove README.md from 126 more leaf modules). Run `archui validate` and capture the exit code.
[eval] Exit code is 127, reflecting that the maximum reported exit code is 127 regardless of how many violations exist beyond that count.

[end] Restore all removed README files. Confirm `archui validate` exits 0.

---

### Group 4: Index fix command

[init] A valid ArchUI project root exists and passes validation. `.archui/index.yaml` accurately reflects the filesystem.

[action] Add a new module folder `new-module/` with a valid README.md (uuid: `aaaabbbb`) but do not add it to `.archui/index.yaml`. Run `archui validate`.
[eval] Validation reports an ERROR for the missing index entry. Exit code is non-zero.

[action] Run `archui index --fix` from the project root.
[eval] The command exits 0. `.archui/index.yaml` now contains an entry mapping `aaaabbbb` to `new-module`. No manual editing was required.

[action] Run `archui validate` after the fix.
[eval] Validation exits 0 and reports all checks passed.

[action] Manually delete `new-module/` without updating the index, then run `archui index --fix`.
[eval] The stale entry for `aaaabbbb` is removed from `.archui/index.yaml`. The fix exits 0.

[end] Confirm `archui validate` passes. No further cleanup needed.

---

### Group 5: Index fix aborts on duplicate UUIDs

[init] A valid ArchUI project root exists and passes validation.

[action] Create two module folders `alpha/` and `beta/`, each with a README.md that claims the same uuid (e.g., `cccc1111`). Add both folders to their parent's `submodules` list. Run `archui index --fix`.
[eval] The fix command aborts without writing a new index. An error message identifies the duplicate uuid and both conflicting paths. Exit code is non-zero.

[end] Remove `alpha/` and `beta/`, revert the parent's `submodules` list, and confirm `archui validate` passes.
