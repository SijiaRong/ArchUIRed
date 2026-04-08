---
name: Validator Test Playbook
description: "Playbook for verifying that the validator orchestrates sub-validators in the correct order, produces unified output, and respects the --only flag for selective execution."
---

## Overview

This playbook verifies the validator's role as the unified orchestrator of all sub-validators. Tests focus on execution order, output format, exit codes, and the ability to run individual sub-validators in isolation.

---

## Playbook

### Group 1: Full validation pipeline on a clean project

[init] A valid ArchUI project root exists. All modules have correct README files, valid frontmatter, well-formed links, and a consistent `.archui/index.yaml`. No violations are present.

[action] Run `archui validate` with no path argument.
[eval] The validator runs all four sub-validators (structure, frontmatter, links, index) in sequence. Exit code is 0. The final summary line reads "Validation complete: all checks passed."

[action] Run `archui validate <project-root>` with an explicit path argument.
[eval] Behavior is identical to running from within the project root. Exit code is 0 and the summary confirms all checks passed.

[end] No cleanup needed. Project state is unchanged.

---

### Group 2: Execution order — structure errors suppress downstream checks

[init] A valid ArchUI project root exists and currently passes validation. A module `broken-module/` with a valid README.md is present and registered in the index.

[action] Delete `broken-module/README.md` so the folder has no README. Also add a syntactically broken YAML frontmatter to a different module's README, and a dangling link uuid to a third module's README. Run `archui validate`.
[eval] The structure-validator reports an ERROR for `broken-module/`. Frontmatter and link checks are skipped for `broken-module/` specifically (no cascading false positives for it). The frontmatter and link errors for the other modules are still reported. All errors appear before the summary line.

[end] Restore `broken-module/README.md`, fix the bad frontmatter, and remove the dangling link. Confirm `archui validate` exits 0.

---

### Group 3: Output format

[init] A valid ArchUI project root exists. Two violations are deliberately introduced: one structural (a folder missing its README) and one frontmatter (a required field left empty in another module's README).

[action] Run `archui validate`.
[eval] Each violation appears on its own line in the format: `ERROR  [rule-id]  path/to/README.md  <human-readable explanation>`. The two violations are listed before the summary line. The summary reads "Validation complete: 2 violation(s) found."

[action] Fix both violations and run `archui validate` again.
[eval] No ERROR lines appear. The summary reads "Validation complete: all checks passed."

[end] No further cleanup needed.

---

### Group 4: Running sub-validators independently with --only

[init] A valid ArchUI project root exists and passes full validation. No violations are present.

[action] Run `archui validate --only structure`.
[eval] Only structural checks are performed. The summary reflects only structure-related results. Exit code is 0.

[action] Introduce a structural violation (delete a leaf module's README) and run `archui validate --only frontmatter`.
[eval] The structural violation is NOT reported. Frontmatter checks run on all modules that have README files. Exit code is 0 (since no frontmatter violation exists).

[action] Run `archui validate --only structure` with the same structural violation in place.
[eval] The structural violation IS reported. Exit code is non-zero.

[action] Restore the deleted README. Run `archui validate --only links` and `archui validate --only index` in sequence.
[eval] Both commands exit 0, confirming only their respective check classes are evaluated each time.

[end] Confirm `archui validate` (full run) exits 0 and reports all checks passed.
