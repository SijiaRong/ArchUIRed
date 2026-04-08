---
name: UUID System Test Playbook
description: "Playbook for verifying correct UUID assignment, index maintenance, and link stability across module renames and moves."
---

## Overview

This playbook verifies that modules receive valid UUIDs, that the UUID-to-path index stays consistent, and that UUID-based links remain stable when modules are renamed or moved.

---

## Playbook

### Group 1: UUID format and uniqueness

[init] A valid ArchUI project root exists with `.archui/index.yaml` and a passing root `README.md`. No other modules are present.

[action] Create a module `module-x/` whose README.md frontmatter sets `uuid` to a 9-character string (one character too long).
[eval] `archui validate` reports an ERROR on `module-x/`: the UUID does not conform to the 8-character lowercase hex format.

[action] Change the UUID to a valid 8-character uppercase hex string (e.g., `AABB1234`).
[eval] `archui validate` reports an ERROR on `module-x/`: UUIDs must be lowercase.

[action] Change the UUID to a valid 8-character lowercase hex string (e.g., `aabb1234`). Add the entry to `.archui/index.yaml`.
[eval] `archui validate` reports no errors for `module-x/`.

[action] Create a second module `module-y/` with the same UUID value `aabb1234` and add a second entry for it in `.archui/index.yaml`.
[eval] `archui validate` reports a duplicate UUID error, identifying both `module-x/` and `module-y/` as sharing UUID `aabb1234`.

[action] Assign `module-y/` a distinct UUID (e.g., `ccdd5678`) and update `.archui/index.yaml` accordingly.
[eval] `archui validate` reports no errors.

[end] Remove `module-x/` and `module-y/` and their entries from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 2: Index staleness and rebuild

[init] A valid ArchUI project root exists and passes validation. A module `tracked-module/` with UUID `11223344` is present and correctly listed in `.archui/index.yaml`.

[action] Rename `tracked-module/` to `renamed-module/` on the filesystem without updating `.archui/index.yaml`.
[eval] `archui validate` reports an index staleness error: UUID `11223344` maps to `tracked-module/` in the index but that path no longer exists on disk.

[action] Run `archui index --fix` to rebuild the index from the current filesystem state.
[eval] `.archui/index.yaml` now maps UUID `11223344` to `renamed-module/`. No staleness errors remain.

[action] Run `archui validate` after the index fix.
[eval] `archui validate` exits with code 0 — no errors reported.

[action] Delete `.archui/index.yaml` entirely.
[eval] `archui validate` warns that the index is missing and offers to rebuild it (or reports that a full tree walk is required). Validation still proceeds but flags the missing index.

[action] Run `archui index --fix` to recreate the index.
[eval] `.archui/index.yaml` is recreated with the correct UUID-to-path mapping for `renamed-module/`. `archui validate` passes.

[end] Remove `renamed-module/` and its entry from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 3: Link stability across renames

[init] A valid ArchUI project root exists and passes validation. Module `source-module/` has a link to the UUID of `target-module/`. Both modules are correctly listed in `.archui/index.yaml`.

[action] Rename `target-module/` to `target-renamed/` on the filesystem. Run `archui index --fix`. Do not change any link declarations.
[eval] `.archui/index.yaml` maps the target UUID to `target-renamed/`. `archui validate` passes with no broken link errors — the link in `source-module/` continues to resolve correctly via UUID.

[action] Move `target-renamed/` to a new parent directory (e.g., `subdir/target-renamed/`). Ensure `subdir/` is itself a valid module. Run `archui index --fix`.
[eval] `.archui/index.yaml` maps the target UUID to `subdir/target-renamed/`. `archui validate` passes with no broken link errors in `source-module/`.

[end] Remove `source-module/`, `subdir/`, and their entries from `.archui/index.yaml`. Confirm `archui validate` passes.
