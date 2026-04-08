---
name: Index Sync Test Playbook
description: "Playbook for verifying that the index-sync validator correctly detects missing entries, stale entries, path mismatches, and duplicate UUIDs in .archui/index.yaml."
---

## Overview

This playbook verifies the index-sync validator's ability to detect all forms of inconsistency between `.archui/index.yaml` and the live filesystem. Tests are grouped by violation type.

---

## Playbook

### Group 1: Missing index entry

[init] A valid ArchUI project root exists and passes full validation. `.archui/index.yaml` accurately reflects all modules.

[action] Create a new module `unregistered/` with a valid README.md (uuid: `eeee1111`) but do not add it to `.archui/index.yaml`. Run `archui validate --only index`.
[eval] An ERROR is reported: `[index/missing-entry]  unregistered/  uuid 'eeee1111' has no entry in index`.

[action] Add the entry `eeee1111: unregistered` to `.archui/index.yaml`. Run `archui validate --only index`.
[eval] No errors are reported for `unregistered/`.

[end] Remove `unregistered/` and its entry from `.archui/index.yaml`. Confirm `archui validate --only index` passes.

---

### Group 2: Stale index entry

[init] A valid ArchUI project root exists and passes full validation. A module `transient/` (uuid: `ffff2222`) is present and correctly registered in `.archui/index.yaml` as `ffff2222: transient`.

[action] Delete the entire `transient/` folder from the filesystem without updating `.archui/index.yaml`. Run `archui validate --only index`.
[eval] An ERROR is reported: `[index/stale-entry]  .archui/index.yaml  uuid 'ffff2222' points to 'transient' which does not exist`.

[action] Re-create `transient/` with its original README.md. Run `archui validate --only index`.
[eval] No errors are reported. The stale entry is no longer stale.

[end] Remove `transient/` and its index entry. Confirm `archui validate --only index` passes.

---

### Group 3: Path mismatch after rename

[init] A valid ArchUI project root exists and passes full validation. A module `old-name/` (uuid: `aaaa3333`) is present and registered as `aaaa3333: old-name` in the index.

[action] Rename the folder to `new-name/` on the filesystem. Update the parent module's `submodules` list to reference `new-name`, but leave `.archui/index.yaml` still pointing to `old-name`. Run `archui validate --only index`.
[eval] Two errors are reported: one stale entry for `aaaa3333` pointing to `old-name` (which no longer exists), and one missing-entry error for `new-name/` (whose uuid is not yet registered at the new path).

[action] Update `.archui/index.yaml` to set `aaaa3333: new-name`. Run `archui validate --only index`.
[eval] No errors are reported. The index now correctly reflects the renamed folder.

[end] Rename `new-name/` back to `old-name/`, update the parent's `submodules` list, and update the index back to `aaaa3333: old-name`. Confirm `archui validate --only index` passes.

---

### Group 4: Duplicate UUIDs in index

[init] A valid ArchUI project root exists and passes full validation.

[action] Manually edit `.archui/index.yaml` to add a second entry for an existing uuid pointing to a different (non-existent) path — for example, if `bbbb4444: module-x` already exists, add `bbbb4444: module-duplicate`. Run `archui validate --only index`.
[eval] An ERROR is reported: `[index/duplicate-uuid]  .archui/index.yaml  uuid 'bbbb4444' appears at both 'module-x' and 'module-duplicate'`. Exit code is non-zero.

[action] Create a new module `module-alpha/` and a new module `module-beta/`, both with README files claiming the same uuid (`cccc5555`). Register both in `.archui/index.yaml` under the same uuid. Run `archui validate --only index`.
[eval] A duplicate-uuid error is reported identifying both paths that claim `cccc5555`.

[action] Remove the duplicate entry from `.archui/index.yaml` (keep only one mapping per uuid). Run `archui validate --only index`.
[eval] No duplicate-uuid errors are reported.

[end] Remove `module-alpha/` and `module-beta/` and their index entries. Revert the manually duplicated entry. Confirm `archui validate --only index` passes.

---

### Group 5: Auto-fix with archui index --fix

[init] A valid ArchUI project root exists and passes full validation.

[action] Introduce three inconsistencies simultaneously: add a new unregistered module, delete a registered module without updating the index, and rename another module without updating the index. Run `archui index --fix`.
[eval] The fix command traverses the filesystem, reads all README files, and rewrites `.archui/index.yaml` from scratch. All three inconsistencies are resolved in a single operation. Exit code is 0.

[action] Run `archui validate --only index` immediately after the fix.
[eval] No index errors are reported.

[end] Restore any deleted modules if needed. Confirm `archui validate` (full run) passes.
