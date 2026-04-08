---
name: Filesystem Rules Test Playbook
description: Playbook for verifying that filesystem structural rules are correctly enforced by the validator and respected by agents.
---

## Overview

This playbook verifies the six filesystem rules of ArchUI. Tests are grouped to share init conditions wherever possible.

---

## Playbook

### Group 1: Missing README and undeclared subfolders

[init] A valid ArchUI project root exists with `.archui/index.yaml` and a passing root `README.md`. No other modules are present.

[action] Create a folder `orphan-module/` at the project root with no `README.md` inside it.
[eval] `archui validate` reports an ERROR on `orphan-module/` citing Rule 2 (every module folder must contain a README.md).

[action] Add a `README.md` to `orphan-module/` with valid frontmatter: `uuid`, `name`, `description`, `submodules: []`, `links: []`. Also add the entry to `.archui/index.yaml`.
[eval] `archui validate` reports no errors for `orphan-module/`.

[action] Create a subfolder `orphan-module/nested-folder/` with a valid `README.md` inside, but do not add `nested-folder` to `orphan-module/README.md`'s `submodules` field.
[eval] `archui validate` reports an ERROR on `orphan-module/` citing Rule 4 (subfolder `nested-folder` is neither a declared submodule nor `resources/`).

[action] Declare `nested-folder` in `orphan-module/README.md` by setting `submodules: [nested-folder]`.
[eval] `archui validate` reports no errors. Both `orphan-module/` and `orphan-module/nested-folder/` pass.

[action] Rename `orphan-module/nested-folder/` to `orphan-module/resources/` and remove `nested-folder` from the `submodules` field.
[eval] `archui validate` reports no errors. `resources/` is recognized as the special exempt folder, not a submodule.

[end] Remove `orphan-module/` and its contents. Remove its entry from `.archui/index.yaml`. Confirm `archui validate` passes with no errors.

---

### Group 2: Submodule declaration drift

[init] A valid ArchUI project root exists and passes validation. A module `parent-module/` is present with `submodules: [child-a]` in its frontmatter, and `parent-module/child-a/` exists with a valid `README.md`.

[action] Rename `parent-module/child-a/` to `parent-module/child-b/` without updating the parent's `submodules` field.
[eval] `archui validate` reports two ERRORs: one for declared submodule `child-a` not found on disk, and one for undeclared folder `child-b` present in `parent-module/`.

[action] Update `parent-module/README.md` to set `submodules: [child-b]`. Update `.archui/index.yaml` to reflect the new path for the child module's UUID.
[eval] `archui validate` passes with no errors for `parent-module/` and `parent-module/child-b/`.

[end] Remove `parent-module/` and all its contents. Remove their entries from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 3: Deep nesting validity

[init] A valid ArchUI project root exists and passes validation.

[action] Create a four-level deep module chain: `a/b/c/d/`, each folder containing a valid `README.md` with proper frontmatter. Each parent declares the next level in its `submodules` field. Add all four to `.archui/index.yaml`.
[eval] `archui validate` passes with no errors at any level.

[action] Remove `a/b/c/d/README.md` (the leaf module loses its README).
[eval] `archui validate` reports an ERROR on `a/b/c/d/` citing Rule 2.

[end] Remove the entire `a/` subtree. Remove their entries from `.archui/index.yaml`. Confirm `archui validate` passes.
